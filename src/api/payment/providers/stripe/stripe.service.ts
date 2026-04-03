import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BillingPeriod, PaymentProvider, TransactionStatus } from '@prisma/generated/client'
import Stripe from 'stripe'

import { PrismaService } from '@core/prisma/prisma.service'

import { returnTransactionObject, returnUserObject, returnUserSubscriptionObject, TPlan, TTransaction, TUser } from '@shared/objects'

import { PaymentWebhookResult } from '@api/payment/interfaces'

@Injectable()
export class StripeService {
	private readonly stripe: Stripe
	private readonly WEBHOOK_SECRET: string

	constructor(
		private readonly configService: ConfigService,
		private readonly prismaService: PrismaService
	) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'), {
			apiVersion: '2026-03-25.dahlia',
		})
		this.WEBHOOK_SECRET = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')
	}

	async create(plan: TPlan, transaction: TTransaction, user: TUser, billingPeriod: BillingPeriod) {
		const priceId = billingPeriod === BillingPeriod.MONTHLY ? plan.stripeMonthlyPriceId : plan.stripeYearlyPriceId

		if (!priceId) throw new BadRequestException('Stripe priceId не найден')

		let customerId = user.stripeCustomerId

		if (!customerId) {
			const customer = await this.stripe.customers.create({
				email: user.email,
				name: user.name,
			})

			customerId = customer.id

			await this.prismaService.user.update({
				where: {
					id: user.id,
				},
				data: {
					stripeCustomerId: customerId,
				},
			})
		}

		const session = await this.stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			customer_email: user.email,
			customer: customerId,
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: this.configService.getOrThrow<string>('FRONTEND_URL'),
			cancel_url: this.configService.getOrThrow<string>('FRONTEND_URL'),
			metadata: {
				provider: 'stripe',
				transactionId: transaction.id,
				planId: plan.id,
				userId: user.id,
			},
		})

		return session
	}

	async handleWebhook(event: Stripe.Event): Promise<PaymentWebhookResult | null> {
		switch (event.type) {
			case 'checkout.session.completed': {
				const payment = event.data.object
				const session = await this.stripe.checkout.sessions.retrieve(payment.id, { expand: ['line_items'] })

				if (!payment.metadata) return null

				const { transactionId, planId, userId } = payment.metadata
				const stripeSubscriptionId: string | undefined =
					typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

				if (!transactionId || !planId || !userId) return null

				if (stripeSubscriptionId) {
					await this.prismaService.userSubscription.update({
						where: {
							userId,
						},
						data: { stripeSubscriptionId },
						select: {},
					})
				}

				return {
					transactionId,
					planId,
					paymentId: payment.id,
					status: TransactionStatus.SUCCESS,
					raw: event,
				}
			}
			case 'invoice.payment_succeeded': {
				const invoice = event.data.object
				const customerId: string | undefined = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

				if (!customerId) return null

				if (invoice.billing_reason !== 'subscription_cycle') return null

				return this.handleAutoBilling(customerId, TransactionStatus.SUCCESS, invoice.id, event)
			}
			case 'invoice.payment_failed': {
				const invoice = event.data.object

				if (invoice.billing_reason === 'subscription_cycle') {
					const customerId: string | undefined = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

					if (!customerId) return null
					return this.handleAutoBilling(customerId, TransactionStatus.FAILED, invoice.id, event)
				} else {
					if (!invoice.metadata) return null

					const { transactionId, planId } = invoice.metadata

					if (!transactionId || !planId) return null

					return {
						transactionId,
						planId,
						paymentId: invoice.id,
						status: TransactionStatus.FAILED,
						raw: event,
					}
				}
			}
			default:
				return null
		}
	}

	async updateAutoRenewal(subscriptionId: string, isAutoRenewal: boolean) {
		await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: !isAutoRenewal })
	}

	async parseEvent(rawBody: Buffer, signature: string): Promise<Stripe.Event> {
		try {
			return await this.stripe.webhooks.constructEventAsync(rawBody, signature, this.WEBHOOK_SECRET)
		} catch (error: any) {
			throw new BadRequestException(`Webhook signature verification failed: ${error.message}`)
		}
	}

	private async handleAutoBilling(
		customerId: string,
		status: TransactionStatus,
		externalId: string,
		event: Stripe.Event
	): Promise<PaymentWebhookResult | null> {
		const user = await this.prismaService.user.findUnique({
			where: {
				stripeCustomerId: customerId,
			},
			select: {
				...returnUserObject,
				subscription: { select: returnUserSubscriptionObject },
				transactions: {
					where: {
						status: TransactionStatus.SUCCESS,
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
					select: returnTransactionObject,
				},
			},
		})

		if (!user || !user.subscription) return null

		const lastTransaction = user.transactions[0]

		if (!lastTransaction || !lastTransaction.userSubscriptionId) return null

		const plan = await this.prismaService.plan.findUnique({
			where: {
				id: user.subscription.planId,
			},
		})

		if (!plan) return null

		const newTransaction = await this.prismaService.transaction.create({
			data: {
				amount: lastTransaction.amount,
				billingPeriod: lastTransaction.billingPeriod,
				provider: PaymentProvider.STRIPE,
				status,
				externalId,
				user: {
					connect: {
						id: user.id,
					},
				},
				userSubscription: {
					connect: {
						id: user.subscription.id,
					},
				},
			},
			select: returnTransactionObject,
		})

		return {
			transactionId: newTransaction.id,
			planId: plan.id,
			paymentId: externalId,
			status,
			raw: event,
		}
	}
}

import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BillingPeriod, Plan, Transaction, TransactionStatus, User } from '@prisma/generated/client'
import Stripe from 'stripe'

import { TPlan, TTransaction } from '@shared/objects'

import { PaymentWebhookResult } from '@api/payment/interfaces'

@Injectable()
export class StripeService {
	private readonly stripe: Stripe
	private readonly WEBHOOK_SECRET: string

	constructor(private readonly configService: ConfigService) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'), {
			apiVersion: '2026-03-25.dahlia',
		})
		this.WEBHOOK_SECRET = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')
	}

	async create(plan: TPlan, transaction: TTransaction, user: User, billingPeriod: BillingPeriod) {
		const priceId = billingPeriod === BillingPeriod.MONTHLY ? plan.stripeMonthlyPriceId : plan.stripeYearlyPriceId

		if (!priceId) throw new BadRequestException('Stripe priceId не найден')

		const session = await this.stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			customer_email: user.email,
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
			},
		})

		return session
	}

	async handleWebhook(event: Stripe.Event): Promise<PaymentWebhookResult | null> {
		switch (event.type) {
			case 'checkout.session.completed': {
				const payment = event.data.object

				if (!payment.metadata) return null

				const { transactionId, planId } = payment.metadata

				if (!transactionId || !planId) return null

				return {
					transactionId,
					planId,
					paymentId: payment.id,
					status: TransactionStatus.SUCCESS,
					raw: event,
				}
			}
			case 'invoice.payment_failed': {
				const invoice = event.data.object

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
			default:
				return null
		}
	}

	async parseEvent(rawBody: Buffer, signature: string): Promise<Stripe.Event> {
		try {
			return await this.stripe.webhooks.constructEventAsync(rawBody, signature, this.WEBHOOK_SECRET)
		} catch (error) {
			throw new BadRequestException(`Webhook signature verification failed: ${error.message}`)
		}
	}
}

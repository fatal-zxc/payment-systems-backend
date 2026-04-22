import { Injectable, NotFoundException } from '@nestjs/common'
import { BillingPeriod, PaymentProvider } from '@prisma/generated/client'
import { ConfirmationEnum } from 'nestjs-yookassa'

import { PrismaService } from '@core/prisma/prisma.service'

import { returnPlanObject, returnTransactionObject, returnUserSubscriptionObject, TUser } from '@shared/objects'

import { InitPaymentRequest } from './dto'
import { CryptopayService } from './providers/cryptopay/cryptopay.service'
import { StripeService } from './providers/stripe/stripe.service'
import { YoomoneyService } from './providers/yoomoney/yoomoney.service'

@Injectable()
export class PaymentService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly yoomoneyService: YoomoneyService,
		private readonly stripeService: StripeService,
		private readonly cryptopayService: CryptopayService
	) {}

	async getHistory(userId: string) {
		return this.prismaService.transaction.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: {
				...returnTransactionObject,
				userSubscription: { select: { ...returnUserSubscriptionObject, plan: { select: returnPlanObject } } },
			},
		})
	}

	async getById(id: string) {
		const transaction = await this.prismaService.transaction.findUnique({
			where: { id },
			select: {
				...returnTransactionObject,
				userSubscription: { select: { ...returnUserSubscriptionObject, plan: { select: returnPlanObject } } },
			},
		})

		if (!transaction) throw new NotFoundException('Транзакция не найдена')

		return transaction
	}

	async init(dto: InitPaymentRequest, user: TUser) {
		const { planId, billingPeriod, provider } = dto

		const plan = await this.prismaService.plan.findUnique({
			where: {
				id: planId,
			},
			select: returnPlanObject,
		})

		if (!plan) throw new NotFoundException('План не найден')

		const amount = billingPeriod === BillingPeriod.YEARLY ? plan.yearlyPrice : plan.monthlyPrice

		const transaction = await this.prismaService.transaction.create({
			data: {
				amount,
				provider,
				billingPeriod,
				user: {
					connect: {
						id: user.id,
					},
				},
				userSubscription: {
					connectOrCreate: {
						where: {
							userId: user.id,
						},
						create: {
							user: {
								connect: {
									id: user.id,
								},
							},
							plan: {
								connect: {
									id: plan.id,
								},
							},
						},
					},
				},
			},
			select: returnTransactionObject,
		})

		let payment: any
		let url: string = ''

		switch (provider) {
			case PaymentProvider.YOOKASSA:
				const yookassaPayment = await this.yoomoneyService.create(plan, transaction)
				payment = yookassaPayment
				if (yookassaPayment.confirmation && yookassaPayment.confirmation.type === ConfirmationEnum.REDIRECT) {
					url = yookassaPayment.confirmation.confirmation_url
				}
				break
			case PaymentProvider.STRIPE:
				const stripePayment = await this.stripeService.create(plan, transaction, user, billingPeriod)
				payment = stripePayment
				if (stripePayment.url) {
					url = stripePayment.url
				}
				break
			case PaymentProvider.CRYPTOPAY:
				const cryptopayPayment = await this.cryptopayService.createInvoice(plan, transaction)
				payment = cryptopayPayment
				url = cryptopayPayment.mini_app_invoice_url
				break
		}

		await this.prismaService.transaction.update({
			where: {
				id: transaction.id,
			},
			data: {
				providerMeta: payment,
			},
		})

		return { url }
	}
}

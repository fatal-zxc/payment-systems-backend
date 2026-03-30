import { Injectable, NotFoundException } from '@nestjs/common'
import { BillingPeriod, PaymentProvider, User } from '@prisma/generated/client'

import { PrismaService } from '@core/prisma/prisma.service'

import { returnTransactionObject } from '@shared/objects'

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
		const transactions = await this.prismaService.transaction.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: returnTransactionObject,
		})

		return transactions
	}

	async init(dto: InitPaymentRequest, user: User) {
		const { planId, billingPeriod, provider } = dto

		const plan = await this.prismaService.plan.findUnique({
			where: {
				id: planId,
			},
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
							id: user.id,
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

		let payment

		switch (provider) {
			case PaymentProvider.YOOKASSA:
				payment = await this.yoomoneyService.create(plan, transaction)
				break
			case PaymentProvider.STRIPE:
				payment = await this.stripeService.create(plan, transaction, user, billingPeriod)
				break
			case PaymentProvider.CRYPTOPAY:
				payment = await this.cryptopayService.createInvoice(plan, transaction)
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

		return payment
	}
}

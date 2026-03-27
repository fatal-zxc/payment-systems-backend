import { Injectable, NotFoundException } from '@nestjs/common'
import { BillingPeriod, PaymentProvider, User } from '@prisma/generated/client'

import { PrismaService } from '@core/prisma/prisma.service'

import { returnTransactionObject } from '@shared/objects'

import { InitPaymentRequest } from './dto'
import { YoomoneyService } from './providers/yoomoney/yoomoney.service'

@Injectable()
export class PaymentService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly yoomoneyService: YoomoneyService
	) {}

	async getHistory(userId: string) {
		const transactions = await this.prismaService.transaction.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: returnTransactionObject,
		})

		return transactions
	}

	async init(dto: InitPaymentRequest, userId: string) {
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
						id: userId,
					},
				},
				userSubscription: {
					connectOrCreate: {
						where: {
							userId,
						},
						create: {
							user: {
								connect: {
									id: userId,
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
				payment = await this.yoomoneyService.create(plan, transaction, billingPeriod)
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

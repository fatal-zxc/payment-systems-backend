import { Injectable, NotFoundException } from '@nestjs/common'
import { PaymentProvider, TransactionStatus } from '@prisma/generated/enums'

import { PrismaService } from '@core/prisma/prisma.service'

import { returnTransactionObject, returnUserSubscriptionObject, TUser } from '@shared/objects'

import { StripeService } from '@api/payment/providers/stripe/stripe.service'

import { UpdateAutoRenewalRequest } from './dto'

@Injectable()
export class UsersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly stripeService: StripeService
	) {}

	async updateAutoRenewal(user: TUser, dto: UpdateAutoRenewalRequest) {
		const { isAutoRenewal } = dto

		const subscription = await this.prismaService.userSubscription.findUnique({
			where: {
				userId: user.id,
			},
			select: {
				...returnUserSubscriptionObject,
				transactions: {
					where: { status: TransactionStatus.SUCCESS },
					orderBy: { createdAt: 'desc' },
					take: 1,
					select: returnTransactionObject,
				},
			},
		})

		if (!subscription) throw new NotFoundException('Подписка не найдена')

		const lastTransaction = subscription.transactions[0]

		if (!lastTransaction) throw new NotFoundException('У пользователя нет успешных транзакций')

		if (lastTransaction.provider === PaymentProvider.STRIPE && subscription.stripeSubscriptionId) {
			await this.stripeService.updateAutoRenewal(subscription.stripeSubscriptionId, isAutoRenewal)
		}

		await this.prismaService.user.update({
			where: {
				id: user.id,
			},
			data: {
				isAutoRenewal,
			},
			select: {},
		})

		return { isAutoRenewal }
	}
}

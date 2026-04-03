import { Injectable, NotFoundException } from '@nestjs/common'
import { PaymentProvider, TransactionStatus } from '@prisma/generated/enums'
import { hash } from 'argon2'

import { PrismaService } from '@core/prisma/prisma.service'

import {
	returnPlanObject,
	returnTransactionObject,
	returnUserObject,
	returnUserSubscriptionObject,
	returnUserWithPasswordObject,
	TUser,
} from '@shared/objects'

import { StripeService } from '@api/payment/providers/stripe/stripe.service'

import { UpdateAutoRenewalRequest } from './dto'

@Injectable()
export class UsersService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly stripeService: StripeService
	) {}

	async getById(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			select: returnUserObject,
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

		return user
	}

	async getByIdWithSubscription(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: { id },
			select: {
				...returnUserObject,
				subscription: {
					select: { ...returnUserSubscriptionObject, plan: { select: returnPlanObject } },
				},
			},
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

		return user
	}

	async getByEmail(email: string, includeSubscription = false) {
		const user = await this.prismaService.user.findUnique({
			where: { email },
			select: {
				...returnUserObject,
				...(includeSubscription && {
					subscription: {
						select: { ...returnUserSubscriptionObject, plan: { select: returnPlanObject } },
					},
				}),
			},
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

		return user
	}

	async getByEmailWithPassword(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: { email },
			select: returnUserWithPasswordObject,
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

		return user
	}

	async create(email: string, name: string, password: string) {
		return this.prismaService.user.create({
			data: {
				email,
				name,
				password: await hash(password),
			},
			select: returnUserObject,
		})
	}

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

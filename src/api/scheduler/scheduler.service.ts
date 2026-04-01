import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PaymentProvider, SubscriptionStatus, TransactionStatus } from '@prisma/generated/enums'

import { PrismaService } from '@core/prisma/prisma.service'

import { returnTransactionObject, returnUserObject } from '@shared/objects'

import { YoomoneyService } from '@api/payment/providers/yoomoney/yoomoney.service'

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly yoomoneyService: YoomoneyService
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleAutoBilling() {
		const users = await this.prismaService.user.findMany({
			where: {
				subscription: {
					endDate: {
						lte: new Date(),
					},
					status: SubscriptionStatus.ACTIVE,
				},
				isAutoRenewal: true,
			},
			select: returnUserObject,
		})

		if (!users.length) {
			this.logger.log(`⚠️ No users found for auto-billing`)
			return
		}

		this.logger.log(`🔎 Found ${users.length} users for auto-billing`)

		for (const user of users) {
			const lastTransaction = await this.prismaService.transaction.findFirst({
				where: {
					userId: user.id,
					status: TransactionStatus.SUCCESS,
				},
				orderBy: {
					createdAt: 'desc',
				},
				select: returnTransactionObject,
			})

			if (!lastTransaction) continue

			if (lastTransaction.provider === PaymentProvider.YOOKASSA) {
				const transaction = await this.prismaService.transaction.create({
					data: {
						amount: lastTransaction.amount,
						provider: PaymentProvider.YOOKASSA,
						billingPeriod: lastTransaction.billingPeriod,
						externalId: lastTransaction.externalId,
						user: {
							connect: {
								id: user.id,
							},
						},
						userSubscription: {
							connect: {
								id: lastTransaction.userSubscription.id,
							},
						},
					},
					select: returnTransactionObject,
				})

				try {
					await this.yoomoneyService.createBySavedCard(transaction.userSubscription.plan, user, transaction)
				} catch (error) {
					await this.prismaService.transaction.update({
						where: {
							id: transaction.id,
						},
						data: {
							status: TransactionStatus.FAILED,
						},
					})

					this.logger.error(`❌ Payment failed: ${user.email} - ${error.message}`)
				}
			}
		}
	}
}

import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PaymentProvider, SubscriptionStatus, TransactionStatus } from '@prisma/generated/enums'

import { PrismaService } from '@core/prisma/prisma.service'

import { MailService } from '@libs/mail/mail.service'

import { returnPlanObject, returnTransactionObject, returnUserObject, returnUserSubscriptionObject } from '@shared/objects'

import { YoomoneyService } from '@api/payment/providers/yoomoney/yoomoney.service'

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly yoomoneyService: YoomoneyService
	) {}

	// auto-billing
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
			select: {
				...returnUserObject,
				transactions: {
					where: {
						status: TransactionStatus.SUCCESS,
					},
					orderBy: {
						createdAt: 'desc',
					},
					take: 1,
					select: { ...returnTransactionObject, userSubscription: { select: returnUserSubscriptionObject } },
				},
			},
		})

		if (!users.length) {
			this.logger.log(`⚠️ No users found for auto-billing`)
			return
		}

		this.logger.log(`🔎 Found ${users.length} users for auto-billing`)

		for (const user of users) {
			const lastTransaction = user.transactions[0]

			if (!lastTransaction) continue

			if (lastTransaction.provider === PaymentProvider.YOOKASSA) {
				const newTransaction = await this.prismaService.transaction.create({
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
					select: {
						...returnTransactionObject,
						userSubscription: { select: { ...returnUserSubscriptionObject, plan: { select: returnPlanObject } } },
					},
				})

				try {
					await this.yoomoneyService.createBySavedCard(newTransaction.userSubscription.plan, user, newTransaction)
				} catch (error: any) {
					await this.prismaService.transaction.update({
						where: {
							id: newTransaction.id,
						},
						data: {
							status: TransactionStatus.FAILED,
						},
						select: {},
					})

					this.logger.error(`❌ Payment failed: ${user.email} - ${error.message}`)
				}
			}
		}
	}

	// expire-subscriptions
	@Cron('5 0 * * *')
	async expireSubscriptions() {
		const now = new Date()

		const subscriptions = await this.prismaService.userSubscription.findMany({
			where: {
				status: SubscriptionStatus.ACTIVE,
				endDate: { lte: now },
			},
			select: {
				...returnUserSubscriptionObject,
				user: {
					select: {
						...returnUserObject,
						transactions: {
							where: { status: TransactionStatus.SUCCESS },
							orderBy: { createdAt: 'desc' },
							take: 1,
							select: returnTransactionObject,
						},
					},
				},
				plan: { select: returnPlanObject },
			},
		})

		const filteredSubscriptions = subscriptions.filter(sub => {
			const lastTransaction = sub.user.transactions[0]

			if (!lastTransaction) return false

			const isManualProvider = lastTransaction.provider === PaymentProvider.CRYPTOPAY
			const isAutoRenewalDisabled = !sub.user.isAutoRenewal

			return isManualProvider || isAutoRenewalDisabled
		})

		if (!filteredSubscriptions.length) {
			this.logger.log(`⚠️ No subscriptions to process`)
			return
		}

		await this.prismaService.userSubscription.updateMany({
			where: {
				id: { in: filteredSubscriptions.map(sub => sub.id) },
			},
			data: { status: SubscriptionStatus.EXPIRED },
		})

		await Promise.all(filteredSubscriptions.map(sub => this.mailService.sendSubscriptionExpiredEmail(sub.user.email)))

		this.logger.log(`🔥 Expired ${filteredSubscriptions.length} subscriptions`)
	}
}

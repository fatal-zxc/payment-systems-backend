import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { BillingPeriod, SubscriptionStatus, TransactionStatus } from '@prisma/generated/enums'

import { PrismaService } from '@core/prisma/prisma.service'

import { MailService } from '@libs/mail/mail.service'

import { returnTransactionObject, TTransaction } from '@shared/objects'

import { PaymentWebhookResult } from './interfaces'

@Injectable()
export class PaymentHandler {
	private readonly logger = new Logger(PaymentHandler.name)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService
	) {}

	async processResult(result: PaymentWebhookResult) {
		const { paymentId, planId, raw, status, transactionId } = result

		const updatedTransaction = await this.prismaService.transaction.update({
			where: {
				id: transactionId,
			},
			data: {
				status,
				externalId: paymentId,
				providerMeta: raw,
			},
			select: returnTransactionObject,
		})

		const subscription = updatedTransaction.userSubscription

		if (status === TransactionStatus.SUCCESS && updatedTransaction.userSubscription) {
			const now = new Date()
			const isPlanChanged = subscription.planId !== planId

			let baseDate: Date

			if (!subscription.endDate || subscription.endDate < now || isPlanChanged) {
				baseDate = new Date(now)
			} else {
				baseDate = new Date(subscription.endDate)
			}

			let newEndDate = new Date(baseDate)

			if (updatedTransaction.billingPeriod === BillingPeriod.YEARLY) {
				newEndDate.setFullYear(newEndDate.getFullYear() + 1)
			} else {
				const currentDay = newEndDate.getDate()
				newEndDate.setMonth(newEndDate.getMonth() + 1)

				if (newEndDate.getDate() !== currentDay) newEndDate.setDate(0)
			}

			await this.prismaService.userSubscription.update({
				where: {
					id: subscription.id,
				},
				data: {
					status: SubscriptionStatus.ACTIVE,
					startDate: now,
					endDate: newEndDate,
					plan: {
						connect: {
							id: planId,
						},
					},
				},
			})

			await this.mailService.sendPaymentSuccessEmail(subscription.user, updatedTransaction)

			this.logger.log(`Payment success: ${subscription.user.email}`)
		} else if (status === TransactionStatus.FAILED) {
			await this.mailService.sendPaymentFailedEmail(subscription.user, updatedTransaction)

			this.logger.error(`❌ Payment failed: ${subscription.user.email}`)
		}

		return { message: 'success' }
	}
}

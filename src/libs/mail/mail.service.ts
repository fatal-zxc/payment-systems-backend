import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import { Queue } from 'bullmq'

import { TTransaction } from '@shared/objects'

import { MAIL_JOB_NAME, MAIL_JOB_OPTIONS } from './constants'
import { PaymentFailedTemplate, PaymentSuccessTemplate, SubscriptionExpiredTemplate } from './templates'

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name)

	private readonly FRONTEND_URL: string

	constructor(
		private readonly configService: ConfigService,
		private readonly mailerService: MailerService,
		@InjectQueue('mail') private readonly queue: Queue
	) {
		this.FRONTEND_URL = configService.getOrThrow<string>('FRONTEND_URL')
	}

	async sendPaymentSuccessEmail(email: string, transaction: TTransaction) {
		const html = await render(PaymentSuccessTemplate({ transaction }))
		await this.addToQueue(email, 'Платеж успешно обработан', html)
	}

	async sendPaymentFailedEmail(email: string, transaction: TTransaction) {
		const html = await render(PaymentFailedTemplate({ transaction }))
		await this.addToQueue(email, 'Проблема с обработкой платежа', html)
	}

	async sendSubscriptionExpiredEmail(email: string) {
		const accountUrl = `${this.FRONTEND_URL}/dashboard`
		const html = await render(SubscriptionExpiredTemplate({ accountUrl }))
		await this.addToQueue(email, 'Ваша подписка истекла', html)
	}

	async sendMail(options: ISendMailOptions) {
		try {
			await this.mailerService.sendMail(options)
		} catch (error) {
			this.logger.error(`❌ Failed to sending email: `, error)
			throw error
		}
	}

	private async addToQueue(email: string, subject: string, html: string) {
		await this.queue.add(MAIL_JOB_NAME, { email, subject, html }, MAIL_JOB_OPTIONS)
	}
}

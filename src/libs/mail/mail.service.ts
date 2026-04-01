import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { render } from '@react-email/components'
import { Queue } from 'bullmq'

import { TTransaction, TUser } from '@shared/objects'

import { MAIL_JOB_NAME, MAIL_JOB_OPTIONS } from './constants'
import { PaymentFailedTemplate, PaymentSuccessTemplate } from './templates'

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name)

	constructor(
		private readonly mailerService: MailerService,
		@InjectQueue('mail') private readonly queue: Queue
	) {}

	async sendPaymentSuccessEmail(user: TUser, transaction: TTransaction) {
		const html = await render(PaymentSuccessTemplate({ transaction }))
		await this.addToQueue(user.email, 'Платеж успешно обработан', html)
	}

	async sendPaymentFailedEmail(user: TUser, transaction: TTransaction) {
		const html = await render(PaymentFailedTemplate({ transaction }))
		await this.addToQueue(user.email, 'Проблема с обработкой платежа', html)
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

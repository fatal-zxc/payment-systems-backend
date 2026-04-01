import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'
import { render } from '@react-email/components'

import { TTransaction, TUser } from '@shared/objects'

import { PaymentFailedTemplate, PaymentSuccessTemplate } from './templates'

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name)

	constructor(private readonly mailerService: MailerService) {}

	async sendPaymentSuccessEmail(user: TUser, transaction: TTransaction) {
		const html = await render(PaymentSuccessTemplate({ transaction }))

		await this.sendMail({
			to: user.email,
			subject: 'Платеж успешно обработан',
			html,
		})
	}

	async sendPaymentFailedEmail(user: TUser, transaction: TTransaction) {
		const html = await render(PaymentFailedTemplate({ transaction }))

		await this.sendMail({
			to: user.email,
			subject: 'Проблема с обработкой платежа',
			html,
		})
	}

	private async sendMail(options: ISendMailOptions) {
		try {
			await this.mailerService.sendMail(options)
		} catch (error) {
			this.logger.error(`Failed to sending email: `, error)
			throw error
		}
	}
}

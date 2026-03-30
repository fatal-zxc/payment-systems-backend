import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Plan, Transaction } from '@prisma/generated/client'
import CIDR from 'ip-cidr'
import { ConfirmationEnum, CurrencyEnum, PaymentMethodsEnum, YookassaService } from 'nestjs-yookassa'
import { PaymentService } from 'nestjs-yookassa/dist/modules/payment/payment.service'

@Injectable()
export class YoomoneyService {
	private readonly paymentService: PaymentService

	private readonly ALLOWED_IPS: string[]

	constructor(
		private readonly yookassaService: YookassaService,
		private readonly configService: ConfigService
	) {
		this.paymentService = yookassaService.payments
		this.ALLOWED_IPS = [
			'185.71.76.0/27',
			'185.71.77.0/27',
			'77.75.153.0/25',
			'77.75.156.11',
			'77.75.156.35',
			'77.75.154.128/25',
			'2a02:5180::/32',
		]
	}

	async create(plan: Plan, transaction: Transaction) {
		const payment = await this.paymentService.create({
			amount: {
				value: transaction.amount,
				currency: CurrencyEnum.RUB,
			},
			description: `Оплата подписки на тарифный план "${plan.title}"`,
			payment_method_data: {
				type: PaymentMethodsEnum.BANK_CARD,
			},
			confirmation: {
				type: ConfirmationEnum.REDIRECT,
				return_url: this.configService.getOrThrow<string>('FRONTEND_URL'),
			},
			save_payment_method: true,
			metadata: {
				provider: 'yookassa',
			},
		})

		return payment
	}

	verifyWebhook(ip: string) {
		for (const range of this.ALLOWED_IPS) {
			if (range.includes('/')) {
				const cidr = new CIDR(range)

				if (cidr.contains(ip)) return
			} else if (ip === range) return
		}

		throw new BadRequestException(`Invalid IP: ${ip}`)
	}
}

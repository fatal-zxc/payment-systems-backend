import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BillingPeriod, Plan, Transaction } from '@prisma/generated/client'
import { ConfirmationEnum, CurrencyEnum, PaymentMethodsEnum, YookassaService } from 'nestjs-yookassa'
import { PaymentService } from 'nestjs-yookassa/dist/modules/payment/payment.service'

@Injectable()
export class YoomoneyService {
	private readonly paymentService: PaymentService
	constructor(
		private readonly yookassaService: YookassaService,
		private readonly configService: ConfigService
	) {
		this.paymentService = yookassaService.payments
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
}

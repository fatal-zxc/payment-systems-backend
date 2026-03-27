import { Injectable } from '@nestjs/common'
import { BillingPeriod, Plan, Transaction } from '@prisma/generated/client'
import { ConfirmationEnum, CurrencyEnum, PaymentMethodsEnum, YookassaService } from 'nestjs-yookassa'
import { PaymentService } from 'nestjs-yookassa/dist/modules/payment/payment.service'

@Injectable()
export class YoomoneyService {
	private readonly paymentService: PaymentService
	constructor(private readonly yookassaService: YookassaService) {
		this.paymentService = yookassaService.payments
	}

	async create(plan: Plan, transaction: Transaction, billingPeriod: BillingPeriod) {
		const amount = billingPeriod === BillingPeriod.MONTHLY ? plan.monthlyPrice : plan.yearlyPrice

		const payment = await this.paymentService.create({
			amount: {
				value: amount,
				currency: CurrencyEnum.RUB,
			},
			description: `Оплата подписки на тарифный план "${plan.title}"`,
			payment_method_data: {
				type: PaymentMethodsEnum.BANK_CARD,
			},
			confirmation: {
				type: ConfirmationEnum.REDIRECT,
				return_url: 'http://localhost:3000',
			},
			save_payment_method: true,
			metadata: {
				provider: 'yookassa',
			},
		})

		return payment
	}
}

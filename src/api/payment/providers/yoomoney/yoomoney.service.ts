import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TransactionStatus } from '@prisma/generated/client'
import CIDR from 'ip-cidr'
import { ConfirmationEnum, CurrencyEnum, PaymentMethodsEnum, VatCodesEnum, YookassaService } from 'nestjs-yookassa'
import { PaymentService } from 'nestjs-yookassa/dist/modules/payment/payment.service'

import { TPlan, TTransaction, TUser } from '@shared/objects'

import { PaymentWebhookResult } from '@api/payment/interfaces'
import { YookassaWebhookDto } from '@api/payment/webhook/dto'

@Injectable()
export class YoomoneyService {
	private readonly paymentService: PaymentService

	private readonly ALLOWED_IPS: string[]
	private readonly FRONTEND_URL: string

	constructor(
		private readonly yookassaService: YookassaService,
		private readonly configService: ConfigService
	) {
		this.paymentService = this.yookassaService.payments
		this.ALLOWED_IPS = [
			'185.71.76.0/27',
			'185.71.77.0/27',
			'77.75.153.0/25',
			'77.75.156.11',
			'77.75.156.35',
			'77.75.154.128/25',
			'2a02:5180::/32',
		]
		this.FRONTEND_URL = this.configService.getOrThrow<string>('FRONTEND_URL')
	}

	async create(plan: TPlan, transaction: TTransaction) {
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
				return_url: `${this.FRONTEND_URL}/payment/${transaction.id}/success`,
			},
			save_payment_method: true,
			metadata: {
				provider: 'yookassa',
				transactionId: transaction.id,
				planId: plan.id,
			},
		})

		return payment
	}

	async createBySavedCard(plan: TPlan, user: TUser, transaction: TTransaction) {
		const payment = await this.paymentService.create({
			amount: {
				value: transaction.amount,
				currency: CurrencyEnum.RUB,
			},
			description: `Рекуррентное списание за тариф "${plan.title}"`,
			receipt: {
				customer: {
					email: user.email,
				},
				items: [
					{
						description: `Рекуррентное списание за тариф "${plan.title}"`,
						quantity: 1,
						amount: {
							value: transaction.amount,
							currency: CurrencyEnum.RUB,
						},
						vat_code: VatCodesEnum.NDS_NONE,
					},
				],
			},
			payment_method_id: transaction.externalId ?? '',
			capture: true,
			save_payment_method: true,
			metadata: {
				provider: 'yookassa',
				transactionId: transaction.id,
				planId: plan.id,
			},
		})

		return payment
	}

	async handleWebhook(dto: YookassaWebhookDto): Promise<PaymentWebhookResult | null> {
		if (!dto.object.metadata) return null
		const { transactionId, planId } = dto.object.metadata
		const paymentId = dto.object.id

		if (!transactionId || !planId) return null

		let status: TransactionStatus = TransactionStatus.PENDING

		switch (dto.event) {
			case 'payment.waiting_for_capture':
				await this.paymentService.capture(paymentId)
				break
			case 'payment.succeeded':
				status = TransactionStatus.SUCCESS
				break
			case 'payment.canceled':
				status = TransactionStatus.FAILED
				break
		}

		return {
			paymentId,
			planId,
			transactionId,
			status,
			raw: dto,
		}
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

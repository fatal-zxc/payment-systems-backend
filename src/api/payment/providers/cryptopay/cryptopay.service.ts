import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BillingPeriod, Plan, Transaction } from '@prisma/generated/client'
import { createHash, createHmac } from 'node:crypto'
import { firstValueFrom } from 'rxjs'

import { CRYPTO_PAY_API_URL } from '@api/payment/constants'

import { CreateInvoiceRequest, CreateInvoiceResponse, CryptoResponse, Currency, FiatCurrency, PaidButtonName } from './interfaces'

@Injectable()
export class CryptopayService {
	private readonly TOKEN: string

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.TOKEN = this.configService.getOrThrow<string>('CRYPTO_PAY_TOKEN')
	}

	async createInvoice(plan: Plan, transaction: Transaction) {
		const payload: CreateInvoiceRequest = {
			amount: transaction.amount,
			currency_type: Currency.FIAT,
			fiat: FiatCurrency.RUB,
			description: `Оплата подписки на тарифный план "${plan.title}"`,
			hidden_message: 'Спасибо за оплату! Подписка активирована.',
			paid_btn_name: PaidButtonName.CALLBACK,
			paid_btn_url: this.configService.getOrThrow<string>('FRONTEND_URL'),
		}

		const response = await this.makeRequest<CreateInvoiceResponse>('POST', '/createInvoice', payload)

		return response.result
	}

	verifyWebhook(rawBody: Buffer, signature: string) {
		const secret = createHash('sha256').update(this.TOKEN).digest()
		const hmac = createHmac('sha256', secret).update(rawBody).digest('hex')

		if (hmac !== signature) throw new BadRequestException('Invalid signature')

		return true
	}

	isFreshRequest(body: any, maxAgeSeconds: number = 300) {
		const requestDate = new Date(body.request_date).getTime()

		const now = Date.now()

		return now - requestDate <= maxAgeSeconds * 1000
	}

	private async makeRequest<T>(method: 'GET' | 'POST', endpoint: string, data?: any) {
		const headers = {
			'Crypto-Pay-API-Token': this.TOKEN,
		}

		const observable = this.httpService.request<CryptoResponse<T>>({
			baseURL: CRYPTO_PAY_API_URL,
			url: endpoint,
			method,
			data,
			headers,
		})

		const { data: response } = await firstValueFrom(observable)

		return response
	}
}

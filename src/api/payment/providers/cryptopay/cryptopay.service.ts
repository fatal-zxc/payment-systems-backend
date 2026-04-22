import { HttpService } from '@nestjs/axios'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Plan, Transaction, TransactionStatus } from '@prisma/generated/client'
import { createHash, createHmac } from 'node:crypto'
import { firstValueFrom } from 'rxjs'

import { TPlan, TTransaction } from '@shared/objects'

import { CRYPTO_PAY_API_URL } from '@api/payment/constants'
import { PaymentWebhookResult } from '@api/payment/interfaces'
import { CryptopayWebhookDto } from '@api/payment/webhook/dto/cryptopay-webhook.dto'

import {
	CreateInvoiceRequest,
	CreateInvoiceResponse,
	CryptoResponse,
	Currency,
	FiatCurrency,
	InvoiceStatus,
	PaidButtonName,
} from './interfaces'

@Injectable()
export class CryptopayService {
	private readonly TOKEN: string
	private readonly FRONTEND_URL: string

	constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.TOKEN = this.configService.getOrThrow<string>('CRYPTO_PAY_TOKEN')
		this.FRONTEND_URL = this.configService.getOrThrow<string>('FRONTEND_URL')
	}

	async createInvoice(plan: TPlan, transaction: TTransaction) {
		const payload: CreateInvoiceRequest = {
			amount: transaction.amount,
			currency_type: Currency.FIAT,
			fiat: FiatCurrency.RUB,
			description: `Оплата подписки на тарифный план "${plan.title}"`,
			hidden_message: 'Спасибо за оплату! Подписка активирована.',
			paid_btn_name: PaidButtonName.CALLBACK,
			paid_btn_url: `${this.FRONTEND_URL}/payment/${transaction.id}/success`,
			payload: Buffer.from(
				JSON.stringify({
					provider: 'cryptopay',
					transactionId: transaction.id,
					planId: plan.id,
				})
			).toString('base64url'),
		}

		const response = await this.makeRequest<CreateInvoiceResponse>('POST', '/createInvoice', payload)

		return response.result
	}

	async handleWebhook(dto: CryptopayWebhookDto): Promise<PaymentWebhookResult | null> {
		const payload = JSON.parse(Buffer.from(dto.payload.payload ?? '', 'base64url').toString('utf-8'))

		const { transactionId, planId } = payload
		const paymentId = dto.payload.invoice_id.toString()

		if (!transactionId || !planId) return null

		let status: TransactionStatus = TransactionStatus.PENDING

		switch (dto.payload.status) {
			case InvoiceStatus.PAID:
				status = TransactionStatus.SUCCESS
				break
			case InvoiceStatus.EXPIRED:
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

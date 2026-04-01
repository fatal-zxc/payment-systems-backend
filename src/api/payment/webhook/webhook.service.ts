import { BadRequestException, Injectable } from '@nestjs/common'

import { PaymentHandler } from '../payment.handler'
import { CryptopayService } from '../providers/cryptopay/cryptopay.service'
import { StripeService } from '../providers/stripe/stripe.service'
import { YoomoneyService } from '../providers/yoomoney/yoomoney.service'

import { YookassaWebhookDto } from './dto'
import { CryptopayWebhookDto } from './dto/cryptopay-webhook.dto'

@Injectable()
export class WebhookService {
	constructor(
		private readonly paymentHandler: PaymentHandler,
		private readonly stripeService: StripeService,
		private readonly cryptopayService: CryptopayService,
		private readonly yoomoneyService: YoomoneyService
	) {}

	async handleYookassa(dto: YookassaWebhookDto, ip: string) {
		this.yoomoneyService.verifyWebhook(ip)

		const result = await this.yoomoneyService.handleWebhook(dto)

		if (!result) return { message: 'success' }

		return this.paymentHandler.processResult(result)
	}

	async handleStripe(rawBody: Buffer, signature: string) {
		if (!signature) throw new BadRequestException('Missing signature')

		const event = await this.stripeService.parseEvent(rawBody, signature)

		const result = await this.stripeService.handleWebhook(event)

		if (!result) return { message: 'success' }

		return this.paymentHandler.processResult(result)
	}

	async handleCryptopay(rawBody: Buffer, signature: string) {
		if (!signature) throw new BadRequestException('Missing signature')

		this.cryptopayService.verifyWebhook(rawBody, signature)

		const body: CryptopayWebhookDto = JSON.parse(rawBody.toString())

		if (!this.cryptopayService.isFreshRequest(body)) throw new BadRequestException('Request too old')

		const result = await this.cryptopayService.handleWebhook(body)

		if (!result) return { message: 'success' }

		return this.paymentHandler.processResult(result)
	}
}

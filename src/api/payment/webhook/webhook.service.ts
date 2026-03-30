import { BadRequestException, Injectable } from '@nestjs/common'

import { CryptopayService } from '../providers/cryptopay/cryptopay.service'
import { StripeService } from '../providers/stripe/stripe.service'
import { YoomoneyService } from '../providers/yoomoney/yoomoney.service'

import { YookassaWebhookDto } from './dto'
import { CryptopayWebhookDto } from './dto/cryptopay-webhook.dto'

@Injectable()
export class WebhookService {
	constructor(
		private readonly stripeService: StripeService,
		private readonly cryptopayService: CryptopayService,
		private readonly yoomoneyService: YoomoneyService
	) {}

	async handleYookassa(dto: YookassaWebhookDto, ip: string) {
		this.yoomoneyService.verifyWebhook(ip)

		console.log('YOOKASSA WEBHOOK: ', dto)

		return { message: 'success' }
	}

	async handleStripe(rawBody: Buffer, signature: string) {
		const event = await this.stripeService.parseEvent(rawBody, signature)

		console.log('STRIPE WEBHOOK: ', event)

		return { message: 'success' }
	}

	async handleCryptopay(rawBody: Buffer, signature: string) {
		this.cryptopayService.verifyWebhook(rawBody, signature)

		const body: CryptopayWebhookDto = JSON.parse(rawBody.toString())

		if (!this.cryptopayService.isFreshRequest(body)) throw new BadRequestException('Request too old')

		console.log('CRYPTO WEBHOOK: ', body)

		return { message: 'success' }
	}
}

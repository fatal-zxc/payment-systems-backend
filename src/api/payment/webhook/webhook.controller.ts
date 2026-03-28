import { Body, Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common'
import { Request } from 'express'

import { WebhookService } from './webhook.service'

@Controller('webhooks')
export class WebhookController {
	constructor(private readonly webhookService: WebhookService) {}

	@Post('yookassa')
	@HttpCode(200)
	async handleYookassa(@Body() dto: any) {
		console.log('YOOKASSA WEBHOOK: ', dto)

		return dto
	}

	@Post('stripe')
	@HttpCode(200)
	async handleStripe(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
		return await this.webhookService.handleStripe(req.rawBody, signature)
	}

	@Post('cryptopay')
	@HttpCode(200)
	async handleCryptopay(@Body() dto: any) {
		console.log('CRYPTOPAY WEBHOOK: ', dto)

		return dto
	}
}

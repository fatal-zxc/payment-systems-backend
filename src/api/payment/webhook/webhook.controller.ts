import { BadRequestException, Body, Controller, Headers, HttpCode, Ip, Post, RawBodyRequest, Req } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { YookassaWebhookDto } from './dto'
import { WebhookService } from './webhook.service'

@ApiTags('Webhook')
@Controller('webhooks')
export class WebhookController {
	constructor(private readonly webhookService: WebhookService) {}

	@ApiOperation({
		summary: 'Handle Yookassa webhook',
		description: 'Processes incoming Yookassa payment notifications and updates payment status accordingly',
	})
	@Post('yookassa')
	@HttpCode(200)
	async handleYookassa(@Body() dto: YookassaWebhookDto, @Ip() ip: string) {
		return this.webhookService.handleYookassa(dto, ip)
	}

	@ApiOperation({
		summary: 'Handle Stripe webhook',
		description: 'Handles incoming Stripe payment events using the signature for verification',
	})
	@Post('stripe')
	@HttpCode(200)
	async handleStripe(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
		return this.webhookService.handleStripe(req.rawBody!, signature)
	}

	@ApiOperation({
		summary: 'Handle CryptoPay webhook',
		description: 'Processes CryptoPay payment notifications, verifying the request signature and freshness',
	})
	@Post('cryptopay')
	@HttpCode(200)
	async handleCryptopay(@Req() req: RawBodyRequest<Request>, @Headers('crypto-pay-api-signature') signature: string) {
		return this.webhookService.handleCryptopay(req.rawBody!, signature)
	}
}

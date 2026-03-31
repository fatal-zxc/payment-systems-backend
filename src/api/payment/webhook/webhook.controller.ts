import { BadRequestException, Body, Controller, Headers, HttpCode, Ip, Post, RawBodyRequest, Req } from '@nestjs/common'
import { Request } from 'express'

import { YookassaWebhookDto } from './dto'
import { WebhookService } from './webhook.service'

@Controller('webhooks')
export class WebhookController {
	constructor(private readonly webhookService: WebhookService) {}

	@Post('yookassa')
	@HttpCode(200)
	async handleYookassa(@Body() dto: YookassaWebhookDto, @Ip() ip: string) {
		return await this.webhookService.handleYookassa(dto, ip)
	}

	@Post('stripe')
	@HttpCode(200)
	async handleStripe(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
		if (!signature) throw new BadRequestException('Missing signature')

		return await this.webhookService.handleStripe(req.rawBody!, signature)
	}

	@Post('cryptopay')
	@HttpCode(200)
	async handleCryptopay(@Req() req: RawBodyRequest<Request>, @Headers('crypto-pay-api-signature') signature: string) {
		if (!signature) throw new BadRequestException('Missing signature')

		return await this.webhookService.handleCryptopay(req.rawBody!, signature)
	}
}

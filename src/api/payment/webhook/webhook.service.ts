import { Injectable } from '@nestjs/common'

import { StripeService } from '../providers/stripe/stripe.service'

@Injectable()
export class WebhookService {
	constructor(private readonly stripeService: StripeService) {}

	async handleStripe(rawBody: any, signature: string) {
		const event = await this.stripeService.parseEvent(rawBody, signature)

		console.log('STRIPE WEBHOOK: ', event)

		return { message: 'success' }
	}
}

import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BillingPeriod, Plan, Transaction, User } from '@prisma/generated/client'
import Stripe from 'stripe'

@Injectable()
export class StripeService {
	private readonly stripe: Stripe
	private readonly WEBHOOK_SECRET: string

	constructor(private readonly configService: ConfigService) {
		this.stripe = new Stripe(this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'), {
			apiVersion: '2026-03-25.dahlia',
		})
		this.WEBHOOK_SECRET = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')
	}

	async create(plan: Plan, transaction: Transaction, user: User, billingPeriod: BillingPeriod) {
		const priceId = billingPeriod === BillingPeriod.MONTHLY ? plan.stripeMonthlyPriceId : plan.stripeYearlyPriceId

		if (!priceId) throw new BadRequestException('Stripe priceId не найден')

		const session = await this.stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			customer_email: user.email,
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: 'subscription',
			success_url: this.configService.getOrThrow<string>('FRONTEND_URL'),
			cancel_url: this.configService.getOrThrow<string>('FRONTEND_URL'),
			metadata: {
				provider: 'stripe',
			},
		})

		return session
	}

	async parseEvent(rawBody: Buffer, signature: string): Promise<Stripe.Event> {
		try {
			return await this.stripe.webhooks.constructEventAsync(rawBody, signature, this.WEBHOOK_SECRET)
		} catch (error) {
			throw new BadRequestException(`Webhook signature verification failed: ${error.message}`)
		}
	}
}

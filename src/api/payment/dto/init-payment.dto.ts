import { ApiProperty } from '@nestjs/swagger'
import { BillingPeriod, PaymentProvider } from '@prisma/generated/enums'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class InitPaymentRequest {
	@ApiProperty({
		example: '01KN4WGHSXQN4J16CE5QWRRANB',
		description: 'ID of the selected subscription plan',
	})
	@IsNotEmpty()
	@IsString()
	planId: string

	@ApiProperty({
		example: BillingPeriod.MONTHLY,
		enum: BillingPeriod,
		description: 'Subscription billing period',
	})
	@IsEnum(BillingPeriod)
	billingPeriod: BillingPeriod

	@ApiProperty({
		example: PaymentProvider.YOOKASSA,
		enum: PaymentProvider,
		description: 'Payment provider',
	})
	@IsEnum(PaymentProvider)
	provider: PaymentProvider
}

export class InitPaymentResponse {
	@ApiProperty({
		example: 'https://checkout.stripe.com/123',
		description: 'URL to redirect the user to external payment provider',
	})
	url: string
}

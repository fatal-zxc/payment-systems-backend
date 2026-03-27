import { BillingPeriod, PaymentProvider } from '@prisma/generated/enums'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class InitPaymentRequest {
	@IsNotEmpty()
	@IsString()
	planId: string

	@IsEnum(BillingPeriod)
	billingPeriod: BillingPeriod

	@IsEnum(PaymentProvider)
	provider: PaymentProvider
}

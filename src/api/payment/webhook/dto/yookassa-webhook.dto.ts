import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Amount, AuthorizationDetails, PaymentMethod, PaymentStatusEnum, Recipient } from 'nestjs-yookassa'

export class CardProduct {
	@IsString()
	code: string

	@IsString()
	name: string
}

export class Card {
	@IsString()
	first6: string

	@IsString()
	last4: string

	@IsString()
	expiry_year: string

	@IsString()
	expiry_month: string

	@IsString()
	card_type: string

	@IsOptional()
	@ValidateNested()
	@Type(() => CardProduct)
	card_product?: CardProduct

	@IsOptional()
	@IsString()
	issuer_country?: string
}

export class PaymentObject {
	@IsString()
	id: string

	@IsEnum(PaymentStatusEnum)
	status: PaymentStatusEnum

	@ValidateNested()
	amount: Amount

	@IsOptional()
	@ValidateNested()
	income_amount?: Amount

	@IsOptional()
	@ValidateNested()
	refunded_amount?: Amount

	@IsString()
	description: string

	@ValidateNested()
	recipient: Recipient

	@ValidateNested()
	payment_method: PaymentMethod

	@IsOptional()
	@IsString()
	captured_at?: string

	@IsString()
	created_at: string

	@IsOptional()
	@IsString()
	expires_at?: string

	@IsBoolean()
	test: boolean

	@IsBoolean()
	paid: boolean

	@IsBoolean()
	refundable: boolean

	@IsOptional()
	@IsObject()
	metadata?: object

	@IsOptional()
	@ValidateNested()
	authorization_details?: AuthorizationDetails
}

export class YookassaWebhookDto {
	@IsString()
	type: string

	@IsString()
	event: string

	@ValidateNested()
	@Type(() => PaymentObject)
	object: PaymentObject
}

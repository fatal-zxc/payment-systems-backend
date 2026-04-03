import { ApiProperty } from '@nestjs/swagger'

import { SubscriptionResponse } from '@shared/responses'

export class GetMeReponse {
	@ApiProperty({
		example: '01KN4WGHSXDAHET19TTEAESJWW',
		description: 'User ID',
	})
	id: string

	@ApiProperty({
		example: 'John Doe',
		description: 'User name',
	})
	name: string

	@ApiProperty({
		example: 'john@example.com',
		description: 'User email address',
	})
	email: string

	@ApiProperty({
		example: true,
		description: 'Whether auto-renewal is enabled',
	})
	isAutoRenewal: boolean

	@ApiProperty({ type: SubscriptionResponse, required: false })
	subscription: SubscriptionResponse | null
}

import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class UpdateAutoRenewalRequest {
	@ApiProperty({
		example: true,
		description: 'Enable or disable autoRenewal',
	})
	@IsBoolean()
	isAutoRenewal: boolean
}

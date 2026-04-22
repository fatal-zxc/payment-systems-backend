import { ApiProperty } from '@nestjs/swagger'
import { SubscriptionStatus } from '@prisma/generated/enums'

import { PlanResponse } from './plan.response'

export class SubscriptionResponse {
	@ApiProperty({
		example: SubscriptionStatus.ACTIVE,
		description: 'Current subscription status',
		enum: SubscriptionStatus,
	})
	status: SubscriptionStatus

	@ApiProperty({
		example: '2026-04-01T13:02:35.450Z',
		description: 'Subscription start date',
		type: 'string',
		nullable: true,
	})
	startDate: Date | null

	@ApiProperty({
		example: '2026-04-01T13:02:35.450Z',
		description: 'Subscription end date',
		type: 'string',
		nullable: true,
	})
	endDate: Date | null

	@ApiProperty({ type: PlanResponse })
	plan: PlanResponse
}

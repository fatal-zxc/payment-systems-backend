import { ApiProperty } from '@nestjs/swagger'
import { PaymentProvider, TransactionStatus } from '@prisma/generated/enums'

import { PlanResponse } from './plan.response'
import { SubscriptionResponse } from './subscription.response'

export class TransactionReponse {
	@ApiProperty({
		description: 'id транзакции',
		example: '01KMNQ8PYGTX7REQADKT1AA933',
	})
	id: string

	@ApiProperty({
		description: 'Дата создания транзакции',
		example: '2026-03-26T15:42:19.223Z',
	})
	createdAt: Date

	@ApiProperty({
		type: SubscriptionResponse,
	})
	userSubscription: SubscriptionResponse

	@ApiProperty({
		description: 'Сумма транзакции',
		example: 2499,
	})
	amount: number

	@ApiProperty({
		description: 'Платежный провайдер транзакции',
		example: PaymentProvider.YOOKASSA,
		enum: PaymentProvider,
	})
	provider: PaymentProvider

	@ApiProperty({
		description: 'Статус транзакции',
		example: TransactionStatus.SUCCESS,
		enum: TransactionStatus,
	})
	status: TransactionStatus
}

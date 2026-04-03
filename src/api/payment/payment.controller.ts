import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Auth, Authorized } from '@shared/decorators'
import { TUser } from '@shared/objects'
import { TransactionReponse } from '@shared/responses'

import { InitPaymentRequest, InitPaymentResponse } from './dto'
import { PaymentService } from './payment.service'

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@ApiOperation({
		summary: 'Получить историю транзакций',
		description: 'Возвращает список всех транзакций пользователя',
	})
	@ApiOkResponse({
		type: [TransactionReponse],
	})
	@ApiBearerAuth()
	@Auth()
	@Get()
	async getHistory(@Authorized('id') userId: string): Promise<TransactionReponse[]> {
		return this.paymentService.getHistory(userId)
	}

	@ApiOperation({
		summary: 'Get payment by ID',
		description: 'Returns detailed information about a specific transaction',
	})
	@ApiOkResponse({
		type: TransactionReponse,
	})
	@ApiBearerAuth()
	@Auth()
	@Get(':id')
	async getById(@Param('id') id: string): Promise<TransactionReponse> {
		return this.paymentService.getById(id)
	}

	@ApiOperation({
		summary: 'Initiate a new payment',
		description: 'Initializes a payment using the selected provider and billing period',
	})
	@ApiOkResponse({ type: InitPaymentResponse })
	@ApiBearerAuth()
	@Auth()
	@Post('init')
	async init(@Body() dto: InitPaymentRequest, @Authorized() user: TUser): Promise<InitPaymentResponse> {
		return this.paymentService.init(dto, user)
	}
}

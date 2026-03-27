import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Auth, Authorized } from '@shared/decorators'

import { InitPaymentRequest, PaymentHistoryResponse } from './dto'
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
		type: [PaymentHistoryResponse],
	})
	@ApiBearerAuth()
	@Auth()
	@Get()
	async getHistory(@Authorized('id') userId: string) {
		return await this.paymentService.getHistory(userId)
	}

	@ApiBearerAuth()
	@Auth()
	@Post()
	async init(@Body() dto: InitPaymentRequest, @Authorized('id') userId: string) {
		return await this.paymentService.init(dto, userId)
	}
}

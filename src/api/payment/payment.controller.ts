import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from '@prisma/generated/client'

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
	@Post('init')
	async init(@Body() dto: InitPaymentRequest, @Authorized() user: User) {
		return await this.paymentService.init(dto, user)
	}
}

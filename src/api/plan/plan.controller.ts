import { Controller, Get, Param } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { PlanResponse } from '@shared/responses'

import { PlanService } from './plan.service'

@ApiTags('Plans')
@Controller('plans')
export class PlanController {
	constructor(private readonly planService: PlanService) {}

	@ApiOperation({
		summary: 'Получить все планы',
		description: 'Возвращает лист планов, отсортированных по цене за месяц',
	})
	@ApiOkResponse({
		type: [PlanResponse],
	})
	@Get()
	async getAll(): Promise<PlanResponse[]> {
		return await this.planService.getAll()
	}

	@ApiOperation({
		summary: 'Получить план по id',
		description: 'Возвращает 1 план по id',
	})
	@ApiOkResponse({
		type: PlanResponse,
	})
	@Get(':id')
	async getById(@Param('id') id: string): Promise<PlanResponse> {
		return await this.planService.getById(id)
	}
}

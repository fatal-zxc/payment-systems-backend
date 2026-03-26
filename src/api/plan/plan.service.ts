import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@core/prisma/prisma.service'

import { returnPlanObject } from '@shared/objects'

@Injectable()
export class PlanService {
	constructor(private readonly prismaService: PrismaService) {}

	async getAll() {
		const plans = await this.prismaService.plan.findMany({
			orderBy: {
				monthlyPrice: 'asc',
			},
			select: returnPlanObject,
		})

		return plans
	}

	async getById(id: string) {
		const plan = await this.prismaService.plan.findUnique({
			where: {
				id,
			},
			select: returnPlanObject,
		})

		if (!plan) throw new NotFoundException('План не найден')

		return plan
	}
}

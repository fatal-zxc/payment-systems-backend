import { PlanSelect } from '@/prisma/generated/models'

export const returnPlanObject: PlanSelect = {
	id: true,
	title: true,
	description: true,
	features: true,
	monthlyPrice: true,
	yearlyPrice: true,
	isFeatured: true,
}

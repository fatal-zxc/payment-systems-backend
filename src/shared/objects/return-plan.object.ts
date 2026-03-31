import { PlanGetPayload, PlanSelect } from '@/prisma/generated/models'

export const returnPlanObject = {
	id: true,
	title: true,
	description: true,
	features: true,
	monthlyPrice: true,
	yearlyPrice: true,
	isFeatured: true,
	stripeMonthlyPriceId: true,
	stripeYearlyPriceId: true,
} satisfies PlanSelect

export type TPlan = PlanGetPayload<{
	select: typeof returnPlanObject
}>

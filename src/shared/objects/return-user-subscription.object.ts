import { UserSubscriptionGetPayload, UserSubscriptionSelect } from '@/prisma/generated/models'

export const returnUserSubscriptionObject = {
	id: true,
	endDate: true,
	planId: true,
	stripeSubscriptionId: true,
} satisfies UserSubscriptionSelect

export type TUserSubscription = UserSubscriptionGetPayload<{
	select: typeof returnUserSubscriptionObject
}>

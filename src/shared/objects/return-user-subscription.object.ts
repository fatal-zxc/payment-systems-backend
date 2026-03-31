import { UserSubscriptionGetPayload, UserSubscriptionSelect } from '@/prisma/generated/models'

import { returnPlanObject } from './return-plan.object'
import { returnUserObject } from './return-user.object'

export const returnUserSubscriptionObject = {
	id: true,
	endDate: true,
	plan: {
		select: returnPlanObject,
	},
	planId: true,
	user: {
		select: returnUserObject,
	},
} satisfies UserSubscriptionSelect

export type TUserSubscription = UserSubscriptionGetPayload<{
	select: typeof returnUserSubscriptionObject
}>

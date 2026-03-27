import { UserSubscriptionSelect } from '@/prisma/generated/models'

import { returnPlanObject } from './return-plan.object'

export const returnUserSubscriptionObject: UserSubscriptionSelect = {
	plan: {
		select: returnPlanObject,
	},
}

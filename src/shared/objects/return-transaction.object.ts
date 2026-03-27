import { TransactionSelect } from '@/prisma/generated/models'

import { returnUserSubscriptionObject } from './return-user-subscription.object'

export const returnTransactionObject: TransactionSelect = {
	id: true,
	createdAt: true,
	userSubscription: {
		select: returnUserSubscriptionObject,
	},
	amount: true,
	provider: true,
	status: true,
}

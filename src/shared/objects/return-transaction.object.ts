import { TransactionGetPayload, TransactionSelect } from '@/prisma/generated/models'

import { returnUserSubscriptionObject } from './return-user-subscription.object'

export const returnTransactionObject = {
	id: true,
	createdAt: true,
	userSubscription: {
		select: returnUserSubscriptionObject,
	},
	userSubscriptionId: true,
	amount: true,
	provider: true,
	status: true,
	billingPeriod: true,
} satisfies TransactionSelect

export type TTransaction = TransactionGetPayload<{
	select: typeof returnTransactionObject
}>

import { TransactionGetPayload, TransactionSelect } from '@/prisma/generated/models'

import { returnUserSubscriptionObject } from './return-user-subscription.object'

export const returnTransactionObject = {
	id: true,
	createdAt: true,
	userSubscriptionId: true,
	amount: true,
	provider: true,
	status: true,
	billingPeriod: true,
	externalId: true,
} satisfies TransactionSelect

export type TTransaction = TransactionGetPayload<{
	select: typeof returnTransactionObject
}>
// создаем отдельный тип только если он используется например в 3+ местах
export type TTransactionWithSubscription = TransactionGetPayload<{
	select: typeof returnTransactionObject & {
		userSubscription: {
			select: typeof returnUserSubscriptionObject
		}
	}
}>

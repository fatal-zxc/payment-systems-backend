import { TransactionStatus } from '@prisma/generated/enums'

export interface PaymentWebhookResult {
	transactionId: string
	planId: string
	paymentId: string
	status: TransactionStatus
	raw: object
}

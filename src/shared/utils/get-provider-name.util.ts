import { PaymentProvider } from '@prisma/generated/enums'

export function getProviderName(provider: PaymentProvider): string {
	switch (provider) {
		case PaymentProvider.YOOKASSA:
			return 'Yookassa'
		case PaymentProvider.STRIPE:
			return 'Stripe'
		case PaymentProvider.CRYPTOPAY:
			return 'CryptoPay'
		default:
			return provider
	}
}

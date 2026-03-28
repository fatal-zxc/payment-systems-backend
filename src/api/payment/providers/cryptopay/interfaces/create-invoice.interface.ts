import { AcceptedCryptoAsset, CryptoAsset, CurrencyType, FiatCurrency } from './common.interface'

export enum PaidButtonName {
	VIEW_ITEM = 'viewItem',
	OPEN_CHANNEL = 'openChannel',
	OPEN_BOT = 'openBot',
	CALLBACK = 'callback',
}

export type InvoiceStatus = 'active' | 'paid' | 'expired'

export enum SwapAsset {
	USDT = 'USDT',
	TON = 'TON',
	TRX = 'TRX',
	ETH = 'ETH',
	SOL = 'SOL',
	BTC = 'BTC',
	LTC = 'LTC',
}

export interface CreateInvoiceRequest {
	currency_type: CurrencyType
	asset?: CryptoAsset
	fiat?: FiatCurrency
	accepted_assets?: AcceptedCryptoAsset
	amount: number
	description?: string
	hidden_message?: string
	paid_btn_name?: PaidButtonName
	paid_btn_url?: string
	payload?: string
	allow_comments?: boolean
	allow_anonymous?: boolean
	expires_in?: number
}

export interface CreateInvoiceResponse {
	invoice_id: number
	hash: string
	currency_type: CurrencyType
	asset?: CryptoAsset
	fiat?: FiatCurrency
	amount: string
	paid_asset?: CryptoAsset
	paid_amount?: string
	paid_fiat_rate?: string
	accepted_assets?: AcceptedCryptoAsset
	fee_asset?: string
	fee_amount?: number
	bot_invoice_url: string
	mini_app_invoice_url: string
	web_app_invoice_url: string
	description?: string
	status: InvoiceStatus
	swap_to?: SwapAsset
	is_swapped?: boolean
	swapped_uid?: string
	swapped_to?: SwapAsset
	swapped_rate?: string
	swapped_output?: string
	swapped_usd_amount?: string
	swapped_usd_rate?: string
	created_at: string
	paid_usd_rate?: string
	allow_comments: boolean
	allow_anonymous: boolean
	expiration_date?: string
	paid_at?: string
	paid_anonymously: boolean
	comment?: string
	hidden_message?: string
	payload?: string
	paid_btn_name?: PaidButtonName
	paid_btn_url?: string
}

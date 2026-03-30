export enum CryptoAsset {
	USDT = 'USDT', // Стейблкоин USDT (Tether)
	TON = 'TON', // Toncoin
	BTC = 'BTC', // Bitcoin
	ETH = 'ETH', // Ethereum
	LTC = 'LTC', // Litecoin
	BNB = 'BNB', // Binance Coin
	TRX = 'TRX', // TRON
	USDC = 'USDC', // USD Coin
}

export enum FiatCurrency {
	USD = 'USD', // Доллар США
	EUR = 'EUR', // Евро
	RUB = 'RUB', // Российский рубль
	BYN = 'BYN', // Белорусский рубль
	UAH = 'UAH', // Украинская гривна
	GBP = 'GBP', // Британский фунт
	CNY = 'CNY', // Китайский юань
	KZT = 'KZT', // Казахстанский тенге
	UZS = 'UZS', // Узбекский сум
	GEL = 'GEL', // Грузинский лари
	TRY = 'TRY', // Турецкая лира
	AMD = 'AMD', // Армянский драм
	THB = 'THB', // Тайский бат
	INR = 'INR', // Индийская рупия
	BRL = 'BRL', // Бразильский реал
	IDR = 'IDR', // Индонезийская рупия
	AZN = 'AZN', // Азербайджанский манат
	AED = 'AED', // Дирхам ОАЭ
	PLN = 'PLN', // Польский злотый
	ILS = 'ILS', // Израильский шекель
}

export enum AcceptedCryptoAsset {
	USDT = 'USDT', // Стейблкоин USDT (Tether)
	TON = 'TON', // Toncoin
	BTC = 'BTC', // Bitcoin
	ETH = 'ETH', // Ethereum
	LTC = 'LTC', // Litecoin
	BNB = 'BNB', // Binance Coin
	TRX = 'TRX', // TRON
	USDC = 'USDC', // USD Coin
	JET = 'JET', // JET (только для testnet)
}

export enum Currency {
	CRYPTO = 'crypto',
	FIAT = 'fiat',
}

export interface CryptoResponse<T> {
	ok: boolean
	result: T
}

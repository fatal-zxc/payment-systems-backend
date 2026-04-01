import { Body, Container, Font, Head, Heading, Html, Preview, Tailwind, Text } from '@react-email/components'
import * as React from 'react'

import { TTransaction } from '@shared/objects'
import { formatTransactionDate, getProviderName } from '@shared/utils'

interface PaymentSuccessTemplateProps {
	transaction: TTransaction
}

export function PaymentSuccessTemplate({ transaction }: PaymentSuccessTemplateProps) {
	return (
		<Html>
			<Head>
				<Font
					fontFamily='Geist'
					fallbackFontFamily='Arial'
					webFont={{ url: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap', format: 'woff2' }}
				/>
			</Head>
			<Tailwind>
				<Preview>Платеж успешно обработан</Preview>
				<Body className='bg-amber-50 font-sans text-gray-700'>
					<Container className='mx-auto max-w-2xl rounded-md bg-white shadow-md'>
						<div className='relative overflow-hidden px-8 py-16'>
							<div className='relative text-center'>
								<Heading className='mb-2 text-2xl font-bold text-slate-900'>Платеж успешно обработан!</Heading>
								<Text className='text-base text-slate-500'>Спасибо за оплату. Ваша подписка активирована</Text>
							</div>

							<div className='mt-8 rounded-xl bg-gray-100 p-8'>
								<Heading className='mb-6 text-xl font-semibold text-slate-900'>Детали платежа</Heading>

								<div className='mb-3 flex justify-between text-sm text-slate-500'>
									<span>ID транзакции:</span>
									<span className='font-mono text-slate-900'>{transaction.id}</span>
								</div>

								<div className='mb-3 flex justify-between text-sm text-slate-500'>
									<span>Дата:</span>
									<span className='font-mono text-slate-900'>{formatTransactionDate(transaction.createdAt)}</span>
								</div>

								<div className='mb-3 flex justify-between text-sm text-slate-500'>
									<span>Способ оплаты:</span>
									<span className='font-mono text-slate-900'>{getProviderName(transaction.provider)}</span>
								</div>

								<div className='mb-3 flex justify-between border-t border-gray-300 pt-3'>
									<span className='text-lg font-semibold text-slate-900'>Итого:</span>
									<span className='text-lg font-bold text-slate-900'>{transaction.amount} ₽</span>
								</div>
							</div>
						</div>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

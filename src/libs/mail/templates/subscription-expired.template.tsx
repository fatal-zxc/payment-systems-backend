import { Body, Button, Container, Font, Head, Heading, Html, Preview, Tailwind, Text } from '@react-email/components'
import * as React from 'react'

interface SubscriptionExpiredTemplateProps {
	accountUrl: string
}

export function SubscriptionExpiredTemplate({ accountUrl }: SubscriptionExpiredTemplateProps) {
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
				<Preview>Ваша подписка истекла</Preview>
				<Body className='bg-gray-50 font-sans text-gray-700'>
					<Container className='mx-auto max-w-2xl rounded-md bg-white shadow-md'>
						<div className='relative overflow-hidden px-8 py-16'>
							<div className='relative text-center'>
								<Heading className='mb-2 text-2xl font-bold text-slate-900'>Подписка истекла</Heading>
								<Text className='text-base text-slate-500'>
									Ваша подписка на сервис закончилась. Чтобы продолжить пользоваться всеми функциями, продлите её в личном кабинете
								</Text>
							</div>

							<div className='mt-10 text-center'>
								<Button href={accountUrl} className='inline-block rounded-xl bg-slate-900 px-6 py-4 font-medium text-white'>
									Перейти в личный кабинет
								</Button>
							</div>
						</div>
						<div className='relative mt-8 text-center text-xs text-slate-500'>
							Если кнопка не работает, откройте ссылку вручную: <br />
							<span className='break-all'>{accountUrl}</span>
						</div>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

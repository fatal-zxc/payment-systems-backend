import { Plan } from '@prisma/generated/client'

export const plans: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>[] = [
	{
		title: 'Базовый',
		description: 'Идеально подходит для малых проектов и индивидуальных предпринимателей.',
		features: ['5 проектов', '10ГБ хранилища', 'Базовая поддержка', 'Доступ к основным функциям'],
		isFeatured: false,
		monthlyPrice: 850,
		yearlyPrice: 8160,
		stripeMonthlyPriceId: 'price_1TFvdxPfPkfK24u9J2lPRuSo',
		stripeYearlyPriceId: 'price_1TFvdxPfPkfK24u9NaX66ypV',
	},
	{
		title: 'Профессиональный',
		description: 'Отлично подходит для развивающихся компаний и команд.',
		features: [
			'Неограниченное количество проектов',
			'100ГБ хранилища',
			'Приоритетная поддержка',
			'Продвинутая аналитика',
			'Функции для команд',
		],
		isFeatured: true,
		monthlyPrice: 2499,
		yearlyPrice: 23990,
		stripeMonthlyPriceId: 'price_1TFvfDPfPkfK24u9v1qIOxJd',
		stripeYearlyPriceId: 'price_1TFvfDPfPkfK24u9YdKKeehw',
	},
	{
		title: 'Бизнес',
		description: 'Для крупных предприятий с высокими требованиями.',
		features: [
			'Неограниченное количество проектов',
			'1ТБ хранилища',
			'Круглосуточная премиум поддержка',
			'Продвинутая безопасность',
			'Пользовательские интеграции',
			'Выделенный менеджер аккаунта',
		],
		isFeatured: false,
		monthlyPrice: 4999,
		yearlyPrice: 47990,
		stripeMonthlyPriceId: 'price_1TFvgDPfPkfK24u956UG4kc7',
		stripeYearlyPriceId: 'price_1TFvgDPfPkfK24u9TC1uvAZc',
	},
]

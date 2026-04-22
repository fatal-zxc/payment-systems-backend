import { ApiProperty } from '@nestjs/swagger'

export class PlanResponse {
	@ApiProperty({
		description: 'ID плана',
		example: '01KMNHPWWTNW5MX9G5NT5DPCPX',
	})
	id: string

	@ApiProperty({
		description: 'Название плана',
		example: 'Premium',
	})
	title: string

	@ApiProperty({
		description: 'Описание плана',
		example: 'Полный доступ ко всем функциям платформы',
	})
	description: string

	@ApiProperty({
		description: 'Список возможностей плана',
		example: ['Безлимитный доступ к контенту', 'Приоритетная поддержка', 'Улучшенная аналитика'],
		isArray: true,
		type: 'string',
	})
	features: string[]

	@ApiProperty({
		description: 'Стоимость месяца',
		example: 100.25,
	})
	monthlyPrice: number

	@ApiProperty({
		description: 'Стоимость года',
		example: 800.99,
	})
	yearlyPrice: number

	@ApiProperty({
		description: 'Показывает продвигается ли план',
		example: false,
	})
	isFeatured: boolean
}

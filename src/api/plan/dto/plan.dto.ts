import { ApiProperty } from '@nestjs/swagger'

export class PlanResponse {
	@ApiProperty({
		description: 'id плана',
		example: '01KMNHPWWTNW5MX9G5NT5DPCPX',
	})
	id: string

	@ApiProperty({
		description: 'название плана',
		example: 'Premium',
	})
	title: string

	@ApiProperty({
		description: 'описание плана',
		example: 'Полный доступ ко всем функциям платформы',
	})
	description: string

	@ApiProperty({
		description: 'список возможностей плана',
		example: ['Безлимитный доступ к контенту', 'Приоритетная поддержка', 'Улучшенная аналитика'],
		isArray: true,
	})
	features: string[]

	@ApiProperty({
		description: 'стоимость месяца',
		example: 100.25,
	})
	monthlyPrice: number

	@ApiProperty({
		description: 'стоимость года',
		example: 800.99,
	})
	yearlyPrice: number

	@ApiProperty({
		description: 'Показывает продвигается ли план',
		example: false,
	})
	isFeatured: boolean
}

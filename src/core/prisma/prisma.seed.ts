import { faker } from '@faker-js/faker'
import { BadRequestException, Logger } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '@prisma/generated/client'
import { UserCreateInput } from '@prisma/generated/models'
import 'dotenv/config'

import { plans } from './data'

const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DATABASE}`
const prisma = new PrismaClient({
	transactionOptions: {
		maxWait: 5000,
		timeout: 10000,
		isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
	},
	adapter: new PrismaPg({ connectionString }),
})

const logger = new Logger('PRISMA SEED')

async function seed() {
	try {
		logger.log('Начало заполнения базы данных')

		await prisma.$transaction([prisma.plan.deleteMany(), prisma.user.deleteMany()])
		logger.log('База данных очищена')

		const usersData: UserCreateInput[] = []

		while (usersData.length < 10) {
			const firstName = faker.person.firstName()
			const lastName = faker.person.lastName()
			usersData.push({
				email: `${firstName}.${lastName}@seed.ru`,
				name: `${firstName} ${lastName}`,
				password: '123456',
			})
		}

		await prisma.user.createMany({
			data: usersData,
		})
		logger.log(`Созданы ${usersData.length} пользователей`)

		await prisma.plan.createMany({
			data: plans,
		})

		logger.log(`Созданы ${plans.length} планов`)

		logger.log('Заполнение базы данных прошло успешно')
	} catch (e) {
		logger.error(e)
		throw new BadRequestException('Ошибка при заполнении базы данных')
	} finally {
		logger.log('Закрытие соединения с бд...')
		await prisma.$disconnect()
		logger.log('Соединение с бд успешно закрыто')
	}
}

seed()

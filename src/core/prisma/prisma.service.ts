import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/generated/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name)

	constructor(private readonly configService: ConfigService) {
		const user = configService.getOrThrow<string>('POSTGRES_USER')
		const pass = configService.getOrThrow<string>('POSTGRES_PASSWORD')
		const host = configService.getOrThrow<string>('POSTGRES_HOST')
		const port = configService.getOrThrow<string>('POSTGRES_PORT')
		const db = configService.getOrThrow<string>('POSTGRES_DATABASE')

		const url = `postgresql://${user}:${pass}@${host}:${port}/${db}`

		super({ adapter: new PrismaPg({ connectionString: url }) })
	}

	public async onModuleInit() {
		this.logger.log('🔄 Initializing database connection...')

		try {
			await this.$connect()

			this.logger.log('✅ Database connection established successfully')
		} catch (error) {
			this.logger.error('❌ Failed to establish database connection: ', error)

			throw error
		}
	}

	public async onModuleDestroy() {
		this.logger.log('🔻 Closing database connection...')

		try {
			await this.$disconnect()

			this.logger.log('🟢 Database connection closed successfully')
		} catch (error) {
			this.logger.error('🔴 Error occurred while closing the database connection: ', error)

			throw error
		}
	}
}

import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { PrismaClientExceptionFilter } from '@shared/filters'

import { AppModule } from './app.module'
import { getSwaggerConfig } from './config'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		rawBody: true,
	})

	const config = app.get(ConfigService)
	const httpAdapterHost = app.get(HttpAdapterHost)

	app.set('trust proxy', true)

	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
		})
	)

	app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapterHost.httpAdapter))

	app.enableCors({
		origin: config.getOrThrow(<string>'ALLOWED_ORIGIN'),
		credentials: true,
	})

	const swaggerConfig = getSwaggerConfig()
	const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

	SwaggerModule.setup('/docs', app, swaggerDocument, {
		jsonDocumentUrl: 'openapi.json',
		yamlDocumentUrl: 'openapi.yaml',
	})

	await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
bootstrap()

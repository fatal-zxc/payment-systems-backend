import { ConfigService } from '@nestjs/config'
import { DocumentBuilder } from '@nestjs/swagger'

import { isDev } from '@shared/utils'

export function getSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle('Payment Systems API')
		.setVersion(process.env.npm_package_version ?? '1.0.0')
		.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
		.build()
}

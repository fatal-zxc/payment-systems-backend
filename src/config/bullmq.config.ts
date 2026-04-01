import { ConfigService } from '@nestjs/config'
import { QueueOptions } from 'bullmq'

import { getRedisConfig } from './redis.config'

export function getBullmqConfig(configService: ConfigService): QueueOptions {
	return {
		connection: {
			retryStrategy: times => Math.min(times * 50, 2000),
			...getRedisConfig(configService),
		},
		prefix: configService.getOrThrow<string>('QUEUE_PREFIX'),
	}
}

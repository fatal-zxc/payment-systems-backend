import { Module } from '@nestjs/common'

import { YoomoneyService } from './yoomoney.service'

@Module({
	providers: [YoomoneyService],
	exports: [YoomoneyService],
})
export class YoomoneyModule {}

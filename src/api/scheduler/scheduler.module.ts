import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'

import { YoomoneyModule } from '@api/payment/providers/yoomoney/yoomoney.module'

import { SchedulerService } from './scheduler.service'

@Module({
	imports: [ScheduleModule.forRoot(), YoomoneyModule],
	providers: [SchedulerService],
})
export class SchedulerModule {}

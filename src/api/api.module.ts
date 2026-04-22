import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { PaymentModule } from './payment/payment.module'
import { PlanModule } from './plan/plan.module'
import { SchedulerModule } from './scheduler/scheduler.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [AuthModule, UsersModule, PaymentModule, SchedulerModule, PlanModule],
})
export class ApiModule {}

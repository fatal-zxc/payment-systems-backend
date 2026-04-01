import { Module } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { PaymentModule } from './payment/payment.module'
import { UsersModule } from './users/users.module'
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
	imports: [AuthModule, UsersModule, PaymentModule, SchedulerModule],
})
export class ApiModule {}

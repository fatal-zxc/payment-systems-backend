import { Module } from '@nestjs/common'

import { StripeModule } from '@api/payment/providers/stripe/stripe.module'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
	imports: [StripeModule],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}

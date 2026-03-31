import { Module } from '@nestjs/common'

import { PaymentHandler } from '../payment.handler'
import { CryptopayModule } from '../providers/cryptopay/cryptopay.module'
import { StripeModule } from '../providers/stripe/stripe.module'
import { YoomoneyModule } from '../providers/yoomoney/yoomoney.module'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
	imports: [StripeModule, CryptopayModule, YoomoneyModule],
	controllers: [WebhookController],
	providers: [WebhookService, PaymentHandler],
})
export class WebhookModule {}

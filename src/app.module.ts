import { LibsModule } from '@libs/libs.module'
import { Module } from '@nestjs/common'

import { CoreModule } from '@core/core.module'

import { ApiModule } from '@api/api.module'

@Module({
	imports: [CoreModule, LibsModule, ApiModule],
})
export class AppModule {}

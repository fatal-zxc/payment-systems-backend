import { UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards'

export const Auth = () => UseGuards(JwtAuthGuard)

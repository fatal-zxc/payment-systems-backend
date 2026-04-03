import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'

import { Auth, Authorized } from '@shared/decorators'
import { TUser } from '@shared/objects'

import { UpdateAutoRenewalRequest } from './dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({
		summary: 'get my profile',
	})
	@ApiBearerAuth()
	@Auth()
	@Get('me')
	async getMe(@Authorized() user: TUser) {
		return user
	}

	@ApiBearerAuth()
	@Auth()
	@Patch('me/auto-renewal')
	async updateAutoRenewal(@Authorized() user: TUser, @Body() dto: UpdateAutoRenewalRequest) {
		return this.usersService.updateAutoRenewal(user, dto)
	}
}

import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'

import { Auth, Authorized } from '@shared/decorators'
import { TUser } from '@shared/objects'

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
}

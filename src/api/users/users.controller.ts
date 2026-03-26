import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { User } from '@prisma/generated/client'

import { Auth, Authorized } from '@shared/decorators'

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
	async getMe(@Authorized() user: User) {
		return user
	}
}

import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Auth, Authorized } from '@shared/decorators'
import { TUser } from '@shared/objects'

import { GetMeReponse, UpdateAutoRenewalRequest, UpdateAutoRenewalResponse } from './dto'
import { UsersService } from './users.service'

@ApiTags('Users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({
		summary: 'Get current user profile',
		description: 'Returns the currently authenticated user along with active subscription info',
	})
	@ApiOkResponse({
		type: GetMeReponse,
	})
	@ApiBearerAuth()
	@Auth()
	@Get('me')
	async getMe(@Authorized('id') id: string): Promise<GetMeReponse | null> {
		return this.usersService.getByIdWithSubscription(id)
	}

	@ApiOperation({
		summary: 'Toggle auto-renewal setting',
		description: 'Enables or disables subscription auto-renewal for the authenticated user',
	})
	@ApiOkResponse({
		type: UpdateAutoRenewalResponse,
	})
	@ApiBearerAuth()
	@Auth()
	@Patch('me/auto-renewal')
	async updateAutoRenewal(@Authorized() user: TUser, @Body() dto: UpdateAutoRenewalRequest): Promise<UpdateAutoRenewalResponse> {
		return this.usersService.updateAutoRenewal(user, dto)
	}
}

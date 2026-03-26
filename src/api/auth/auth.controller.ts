import { Body, Controller, Post, Req, Res } from '@nestjs/common'
import { ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { AuthResponse, LoginRequest, RegisterRequest } from './dto'

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({
		summary: 'register a new user',
	})
	@ApiCreatedResponse({
		type: AuthResponse,
	})
	@ApiConflictResponse({
		description: 'Запись с таким значением уже существует',
	})
	@Post('register')
	async register(@Res({ passthrough: true }) res: Response, @Body() dto: RegisterRequest) {
		return await this.authService.register(res, dto)
	}

	@ApiOperation({
		summary: 'login an existing user',
	})
	@ApiOkResponse({
		type: AuthResponse,
	})
	@Post('login')
	async login(@Res({ passthrough: true }) res: Response, @Body() dto: LoginRequest) {
		return await this.authService.login(res, dto)
	}

	@ApiOperation({
		summary: 'refresh access token',
	})
	@ApiOkResponse({
		type: AuthResponse,
	})
	@Post('refresh')
	async refresh(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
		return await this.authService.refresh(req, res)
	}

	@ApiOperation({
		summary: 'logout user',
		description: 'clears authentification cookies',
	})
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		return await this.authService.logout(res)
	}
}

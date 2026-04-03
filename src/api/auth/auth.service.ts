import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { Request, Response } from 'express'
import type { StringValue } from 'ms'

import { JwtPayload } from '@shared/types'
import { isDev, msFn } from '@shared/utils'

import { UsersService } from '@api/users/users.service'

import { LoginRequest, RegisterRequest } from './dto'

@Injectable()
export class AuthService {
	private readonly JWT_ACCESS_TOKEN_TTL: StringValue
	private readonly JWT_REFRESH_TOKEN_TTL: StringValue

	private readonly COOKIES_DOMAIN: string

	constructor(
		private readonly usersService: UsersService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {
		this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<StringValue>('JWT_ACCESS_TOKEN_TTL')
		this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_TTL')
		this.COOKIES_DOMAIN = configService.getOrThrow<string>('COOKIES_DOMAIN')
	}

	async register(res: Response, dto: RegisterRequest) {
		const { name, email, password } = dto

		const user = await this.usersService.create(email, name, password)

		return this.auth(res, user.id)
	}

	async login(res: Response, dto: LoginRequest) {
		const { email, password } = dto

		const user = await this.usersService.getByEmailWithPassword(email)

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) throw new BadRequestException('Неверный пароль или логин')

		return this.auth(res, user.id)
	}

	async refresh(req: Request, res: Response) {
		if (!req || !req.cookies) throw new UnauthorizedException('Не удалось получить куки авторизации')

		const refreshToken = req.cookies['refreshToken']

		if (!refreshToken) throw new UnauthorizedException('Не удалось получить куки авторизации')

		const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken)

		if (!payload) throw new UnauthorizedException('Не валидный куки авторизации')

		const user = await this.usersService.getById(payload.id)

		return this.auth(res, user.id)
	}

	async logout(res: Response) {
		return this.setCookie(res, '', new Date(0))
	}

	private async auth(res: Response, userId: string) {
		const { accessToken, refreshToken, refreshTokenExpires } = await this.generateTokens({ id: userId })

		this.setCookie(res, refreshToken, refreshTokenExpires)

		return { accessToken }
	}

	private async generateTokens(payload: JwtPayload) {
		const refreshTokenExpires = new Date(Date.now() + msFn(this.JWT_REFRESH_TOKEN_TTL))

		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.JWT_ACCESS_TOKEN_TTL,
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.JWT_REFRESH_TOKEN_TTL,
		})

		return {
			accessToken,
			refreshToken,
			refreshTokenExpires,
		}
	}

	private setCookie(res: Response, value: string, expires: Date) {
		res.cookie('refreshToken', value, {
			httpOnly: true,
			secure: !isDev(this.configService),
			domain: this.COOKIES_DOMAIN,
			expires,
			sameSite: 'lax',
		})
	}
}

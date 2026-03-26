import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/generated/client'
import { hash, verify } from 'argon2'
import { Request, Response } from 'express'
import type { StringValue } from 'ms'

import { PrismaService } from '@core/prisma/prisma.service'

import { JwtPayload } from '@shared/types'
import { isDev, msFn } from '@shared/utils'

import { LoginRequest, RegisterRequest } from './dto'

@Injectable()
export class AuthService {
	private readonly JWT_ACCESS_TOKEN_TTL: StringValue
	private readonly JWT_REFRESH_TOKEN_TTL: StringValue

	private readonly COOKIES_DOMAIN: string

	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {
		this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<StringValue>('JWT_ACCESS_TOKEN_TTL')
		this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_TTL')
		this.COOKIES_DOMAIN = configService.getOrThrow<string>('COOKIES_DOMAIN')
	}

	async register(res: Response, dto: RegisterRequest) {
		const { name, email, password } = dto

		const user = await this.prismaService.user.create({
			data: {
				email,
				name,
				password: await hash(password),
			},
		})

		return this.auth(res, user)
	}

	async login(res: Response, dto: LoginRequest) {
		const { email, password } = dto

		const user = await this.prismaService.user.findUnique({
			where: {
				email,
			},
		})

		if (!user) throw new BadRequestException('Неверный пароль или логин')

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) throw new BadRequestException('Неверный пароль или логин')

		return this.auth(res, user)
	}

	async refresh(req: Request, res: Response) {
		if (!req || !req.cookies) throw new UnauthorizedException('Не удалось получить куки авторизации')

		const refreshToken = req.cookies['refreshToken']

		if (!refreshToken) throw new UnauthorizedException('Не удалось получить куки авторизации')

		const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken)

		if (!payload) throw new UnauthorizedException('Не валидный куки авторизации')

		const user = await this.prismaService.user.findUnique({
			where: {
				id: payload.id,
			},
		})

		if (!user) throw new UnauthorizedException('Не валидный куки авторизации')

		return this.auth(res, user)
	}

	async logout(res: Response) {
		return this.setCookie(res, '', new Date(0))
	}

	private async auth(res: Response, user: User) {
		const { accessToken, refreshToken, refreshTokenExpires } = await this.generateTokens(user)

		this.setCookie(res, refreshToken, refreshTokenExpires)

		return { accessToken }
	}

	private async generateTokens(user: User) {
		const payload: JwtPayload = {
			id: user.id,
		}

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

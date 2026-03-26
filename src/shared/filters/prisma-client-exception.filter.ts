import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/generated/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError) // Ловим только ошибки Prisma
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
	private readonly logger = new Logger(PrismaClientExceptionFilter.name)

	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const request = ctx.getRequest<Request>()
		const response = ctx.getResponse<Response>()
		const message = exception.message.replace(/\n/g, '')

		const errorLog = {
			code: exception.code,
			timestamp: new Date().toISOString(),
			path: request.url,
			method: request.method,
			model: exception.meta?.modelName,
			target: exception.meta?.target,
			// Стек-трейс пишем только если это не 404/409, чтобы не забивать память
			stack: !['P2002', 'P2025'].includes(exception.code) ? exception.stack : undefined,
		}

		if (['P2002', 'P2025'].includes(exception.code)) {
			this.logger.warn(`Prisma Error ${exception.code}`, errorLog)
		} else {
			this.logger.warn(`Prisma Error ${exception.code}`, errorLog)
		}

		switch (exception.code) {
			case 'P2002': {
				// Ошибка уникальности (email уже есть)
				const status = HttpStatus.CONFLICT

				// 1. Пробуем взять из метаданных (нормальный путь)
				let target = (exception.meta?.target as string[])?.join(', ')
				const fields = (exception.meta?.target as string[]) || []

				// 2. Если мета пустая, пробуем ОСТОРОЖНО достать поле из сообщения для логов
				if (!target && exception.message.includes('email')) {
					target = 'email'
					fields.push('email')
				}

				response.status(status).json({
					statusCode: status,
					message: `Запись с таким значением уже существует${target ? `: ${target}` : ''}`,
					error: 'Conflict',
					fields,
				})
				break
			}
			case 'P2025': {
				// Запись не найдена (ошибка update/delete)
				const status = HttpStatus.NOT_FOUND
				response.status(status).json({
					statusCode: status,
					message: 'Запись не найдена в базе данных',
					error: 'Not Found',
				})
				break
			}
			default:
				// Все остальные ошибки Prisma (P2003, P2024 и т.д.) пробрасываем как 500
				super.catch(exception, host)
				break
		}
	}
}

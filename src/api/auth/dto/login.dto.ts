import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator'

export class LoginRequest {
	@ApiProperty({
		example: 'john@example.com',
		description: 'user email',
	})
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string

	@ApiProperty({
		example: 'strongPassword123',
		description: 'user password',
	})
	@IsString()
	@IsNotEmpty()
	@Length(6, 50)
	password: string
}

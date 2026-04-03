import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator'

export class RegisterRequest {
	@ApiProperty({
		example: 'John Doe',
		description: 'User name',
	})
	@IsString()
	@IsNotEmpty()
	@Length(2, 40)
	name: string

	@ApiProperty({
		example: 'john@example.com',
		description: 'User email address',
	})
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email: string

	@ApiProperty({
		example: 'strongPassword123',
		description: 'User password',
	})
	@IsString()
	@IsNotEmpty()
	@Length(6, 50)
	password: string
}

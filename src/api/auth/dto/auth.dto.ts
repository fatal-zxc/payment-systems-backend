import { ApiProperty } from '@nestjs/swagger'

export class AuthResponse {
	@ApiProperty({
		description: 'access token for auth',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	accessToken: string
}

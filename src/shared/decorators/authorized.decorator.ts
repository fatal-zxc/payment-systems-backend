import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { TUser } from '@shared/objects'

export const Authorized = createParamDecorator((data: keyof TUser, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest()
	const user = request.user

	return data ? user[data] : user
})

import { UserGetPayload, UserSelect } from '@/prisma/generated/models'

export const returnUserObject = {
	id: true,
	email: true,
	name: true,
} satisfies UserSelect

export type TUser = UserGetPayload<{
	select: typeof returnUserObject
}>

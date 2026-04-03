import { UserGetPayload, UserSelect } from '@/prisma/generated/models'

export const returnUserObject = {
	id: true,
	email: true,
	name: true,
	stripeCustomerId: true,
	isAutoRenewal: true,
} satisfies UserSelect

export const returnUserWithPasswordObject = {
	...returnUserObject,
	password: true,
} satisfies UserSelect

export type TUserWithPassword = UserGetPayload<{
	select: typeof returnUserWithPasswordObject
}>

export type TUser = UserGetPayload<{
	select: typeof returnUserObject
}>

import { UserSelect } from '@/prisma/generated/models'

export const returnUserObject: UserSelect = {
	id: true,
	email: true,
	name: true,
}

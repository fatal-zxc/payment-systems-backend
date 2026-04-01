import { format } from 'date-fns'

export function formatTransactionDate(date: string | Date): string {
	return format(new Date(date), 'dd.MM.yyyy')
}

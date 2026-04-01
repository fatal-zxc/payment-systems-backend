export const MAIL_JOB_NAME = 'send-email'

export const MAIL_JOB_OPTIONS = {
	removeOnComplete: true,
	removeOnFail: false,
	attempts: 3,
	backoff: {
		type: 'exponential' as const,
		delay: 1000,
	},
}

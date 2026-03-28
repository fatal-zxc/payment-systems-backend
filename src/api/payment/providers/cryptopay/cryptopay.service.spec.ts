import { Test, TestingModule } from '@nestjs/testing'

import { CryptopayService } from './cryptopay.service'

describe('CryptopayService', () => {
	let service: CryptopayService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CryptopayService],
		}).compile()

		service = module.get<CryptopayService>(CryptopayService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})

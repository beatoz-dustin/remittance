import { Module } from '@nestjs/common';
import { RemittanceController } from './remittance.controller';
import { RemittanceService } from './remittance.service';

@Module({
  // 송금 접수는 payment의 완료 이벤트를 받은 다음 흐름을 흉내낸다.
  controllers: [RemittanceController],
  providers: [RemittanceService],
})
export class RemittanceModule {}

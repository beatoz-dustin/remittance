import { Module } from '@nestjs/common';
import { ApproveController } from './approve.controller';
import { ApproveService } from './approve.service';

@Module({
  // 승인 모듈은 내부 검증을 통과한 뒤 상태를 바꾸는 역할을 흉내낸다.
  controllers: [ApproveController],
  providers: [ApproveService],
})
export class ApproveModule {}

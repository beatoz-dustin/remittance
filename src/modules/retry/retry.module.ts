import { Module } from '@nestjs/common';
import { RetryController } from './retry.controller';
import { RetryService } from './retry.service';

@Module({
  // 재시도는 운영에서 아주 흔하고, 실패/복구 경로를 나눌 때 유용하다.
  controllers: [RetryController],
  providers: [RetryService],
})
export class RetryModule {}

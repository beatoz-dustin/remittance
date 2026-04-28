import { Module } from '@nestjs/common';
import { AuditProbeController } from './audit-probe.controller';
import { AuditProbeService } from './audit-probe.service';

@Module({
  // zero trust probe는 remittance가 audit를 직접 호출할 수 있는지 확인하는 실험용 모듈이다.
  controllers: [AuditProbeController],
  providers: [AuditProbeService],
})
export class AuditProbeModule {}

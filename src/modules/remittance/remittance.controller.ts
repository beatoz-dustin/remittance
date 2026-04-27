import { Body, Controller, Post } from '@nestjs/common';
import { RemittanceService } from './remittance.service';

@Controller('remittances')
export class RemittanceController {
  constructor(private readonly remittanceService: RemittanceService) {}

  // 송금 요청 접수:
  // payment에서 받은 신호를 송금 단계로 옮긴다고 생각하면 된다.
  @Post('request')
  async requestRemittance(
    @Body('message') message: string,
  ): Promise<{
    service: string;
    action: string;
    message: string;
    databaseNow: string;
    kafkaTopic: string;
  }> {
    return this.remittanceService.requestRemittance(message);
  }
}

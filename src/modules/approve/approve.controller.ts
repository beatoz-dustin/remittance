import { Body, Controller, Post } from '@nestjs/common';
import { ApproveService } from './approve.service';

@Controller('remittances')
export class ApproveController {
  constructor(private readonly approveService: ApproveService) {}

  @Post('approve')
  async approveRemittance(
    @Body('message') message: string,
  ): Promise<{
    service: string;
    action: string;
    message: string;
    databaseNow: string;
    kafkaTopic: string;
  }> {
    return this.approveService.approveRemittance(message);
  }
}

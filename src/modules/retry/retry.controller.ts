import { Body, Controller, Post } from '@nestjs/common';
import { RetryService } from './retry.service';

@Controller('remittances')
export class RetryController {
  constructor(private readonly retryService: RetryService) {}

  @Post('retry')
  async retryRemittance(
    @Body('message') message: string,
  ): Promise<{
    service: string;
    action: string;
    message: string;
    databaseNow: string;
    kafkaTopic: string;
  }> {
    return this.retryService.retryRemittance(message);
  }
}

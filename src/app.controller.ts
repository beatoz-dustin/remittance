import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return 'remittance app is running';
  }

  @Get('health')
  getHealth(): { service: string; status: string } {
    return { service: 'remittance', status: 'ok' };
  }
}

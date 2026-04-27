import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { InfraModule } from './infra/infra.module';
import { ApproveModule } from './modules/approve/approve.module';
import { RemittanceModule } from './modules/remittance/remittance.module';
import { RetryModule } from './modules/retry/retry.module';

@Module({
  // remittance 앱은 송금과 그에 딸린 후속 업무를 모듈별로 나눈다.
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfraModule,
    RemittanceModule,
    ApproveModule,
    RetryModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}

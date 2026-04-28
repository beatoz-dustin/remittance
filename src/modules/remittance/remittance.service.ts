import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infra/database.service';
import { HttpBridgeService } from '../../infra/http-bridge.service';
import { KafkaService } from '../../infra/kafka.service';

type LabResponse = {
  service: string;
  action: string;
  message: string;
  databaseNow: string;
  kafkaTopic: string;
};

@Injectable()
export class RemittanceService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpBridgeService: HttpBridgeService,
    private readonly kafkaService: KafkaService,
  ) {}

  // 송금 요청은 payment와 분리된 또 다른 쓰기 경로다.
  // 이 메서드는 DB와 Kafka를 함께 지나가면서 "송금이 단독 권한이 필요한 이유"를 보여준다.
  async requestRemittance(message: string): Promise<LabResponse> {
    return this.trace(
      'remittance.requested',
      '결제 완료 이후 송금 접수를 시작하는 단독 작업',
      message,
      'remittance.events',
    );
  }

  private async trace(
    action: string,
    why: string,
    inputMessage: string,
    topic: string,
  ): Promise<LabResponse> {
    const databaseNow = await this.databaseService.ping();
    const message = `remittance 서비스가 "${action}" 작업을 처리했다. 이유: ${why}. 요청 메시지: ${inputMessage}. DB 시각: ${databaseNow}. Kafka 토픽: ${topic}.`;

    // eslint-disable-next-line no-console
    console.log(`[remittance] ${message}`);

    await this.kafkaService.publish(
      topic,
      JSON.stringify({
        service: 'remittance',
        action,
        why,
        inputMessage,
        databaseNow,
      }),
    );

    await this.httpBridgeService.sendLog(message, action, why, inputMessage);
    return {
      service: 'remittance',
      action,
      message,
      databaseNow,
      kafkaTopic: topic,
    };
  }
}

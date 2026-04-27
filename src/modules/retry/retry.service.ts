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
export class RetryService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpBridgeService: HttpBridgeService,
    private readonly kafkaService: KafkaService,
  ) {}

  // 재시도는 중복 처리/멱등성 이야기를 꺼내기 좋다.
  async retryRemittance(message: string): Promise<LabResponse> {
    return this.trace(
      'remittance.retry',
      '실패한 송금을 다시 시도하는 별도 경로',
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
    await this.httpBridgeService.sendAudit(message, action, why, inputMessage);

    return {
      service: 'remittance',
      action,
      message,
      databaseNow,
      kafkaTopic: topic,
    };
  }
}

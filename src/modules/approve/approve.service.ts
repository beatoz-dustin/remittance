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
export class ApproveService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly httpBridgeService: HttpBridgeService,
    private readonly kafkaService: KafkaService,
  ) {}

  // 승인 단계는 "누가 승인할 수 있나" 같은 권한 분리를 실습하기 좋다.
  async approveRemittance(message: string): Promise<LabResponse> {
    return this.trace(
      'remittance.approved',
      '송금 승인 권한과 일반 접수 권한이 다르다는 점을 보여주는 작업',
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
    const downstreamResponse = await this.httpBridgeService.postService<{
      service: string;
      action: string;
      message: string;
      databaseNow: string;
      kafkaTopic: string;
    }>(
      'SETTLEMENT_SERVICE_URL',
      'http://localhost:3003',
      '/settlements/aggregate',
      {
        message: 'remittance 승인 완료 후 settlement 집계를 요청한다.',
      },
      'remittance가 settlement 서비스를 호출함',
    );

    // eslint-disable-next-line no-console
    console.log(
      `[remittance] settlement 응답을 받음: ${downstreamResponse.action} / ${downstreamResponse.message}`,
    );

    return {
      service: 'remittance',
      action,
      message,
      databaseNow,
      kafkaTopic: topic,
    };
  }
}

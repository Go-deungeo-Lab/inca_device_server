// src/system/system.service.ts - SSE 기능 추가
import { Injectable, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, Subject, interval } from 'rxjs';
import { SystemConfig } from './entities/system-config.entity';
import { UpdateSystemConfigDto, SystemStatusDto } from './dto/system.dto';

@Injectable()
export class SystemService {
  // 🆕 SSE 스트림을 위한 Subject
  private statusUpdateSubject = new Subject<SystemStatusDto>();
  private activeConnections = new Set<string>();

  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
  ) {}

  // 시스템 설정 조회 (없으면 기본값 생성)
  async getSystemConfig(): Promise<SystemConfig> {
    let config = await this.systemConfigRepository.findOne({
      where: { id: 1 },
    });

    if (!config) {
      config = this.systemConfigRepository.create({
        id: 1,
        isTestMode: false,
        testMessage: null,
        testStartDate: null,
        testEndDate: null,
        testType: null,
      });
      await this.systemConfigRepository.save(config);
    }

    return config;
  }

  // 🔓 공개 API - 시스템 상태 조회 (사용자용)
  async getSystemStatus(): Promise<SystemStatusDto> {
    const config = await this.getSystemConfig();
    const now = new Date();

    let isInTestPeriod = config.isTestMode;

    if (config.isTestMode && config.testStartDate && config.testEndDate) {
      isInTestPeriod = now >= config.testStartDate && now <= config.testEndDate;
    }

    return {
      isTestMode: isInTestPeriod,
      testMessage: config.testMessage,
      testStartDate: config.testStartDate,
      testEndDate: config.testEndDate,
      testType: config.testType,
      canRentDevices: !isInTestPeriod,
    };
  }

  // 🆕 SSE 스트림 생성
  getStatusStream(): Observable<MessageEvent> {
    // 고유 연결 ID 생성
    const connectionId = Math.random().toString(36).substring(7);
    this.activeConnections.add(connectionId);

    // 초기 상태와 업데이트 스트림 결합
    const initialStatus$ = this.getSystemStatus().then((status) => status);

    return new Observable<MessageEvent>((observer) => {
      // 초기 상태 전송
      initialStatus$.then((status) => {
        observer.next({
          data: JSON.stringify({
            type: 'SYSTEM_STATUS_UPDATE',
            payload: status,
          }),
        } as MessageEvent);
      });

      // 상태 업데이트 구독
      const subscription = this.statusUpdateSubject.subscribe((status) => {
        observer.next({
          data: JSON.stringify({
            type: 'SYSTEM_STATUS_UPDATE',
            payload: status,
          }),
        } as MessageEvent);
      });

      // 주기적 heartbeat (30초마다)
      const heartbeat = interval(30000).subscribe(() => {
        observer.next({
          data: JSON.stringify({
            type: 'HEARTBEAT',
            timestamp: new Date().toISOString(),
          }),
        } as MessageEvent);
      });

      // 연결 종료시 정리
      return () => {
        this.activeConnections.delete(connectionId);
        subscription.unsubscribe();
        heartbeat.unsubscribe();
        console.log(
          `SSE 연결 종료: ${connectionId}, 활성 연결: ${this.activeConnections.size}`,
        );
      };
    });
  }

  // 🔒 관리자용 - 시스템 설정 업데이트 (SSE 브로드캐스트 포함)
  async updateSystemConfig(
    updateDto: UpdateSystemConfigDto,
  ): Promise<SystemConfig> {
    const config = await this.getSystemConfig();
    const wasTestMode = config.isTestMode;

    // 데이터 업데이트
    config.isTestMode = updateDto.isTestMode;
    config.testMessage = updateDto.testMessage ?? null;
    config.testType = updateDto.testType ?? null;

    if (updateDto.testStartDate) {
      config.testStartDate = new Date(updateDto.testStartDate);
    } else {
      config.testStartDate = null;
    }

    if (updateDto.testEndDate) {
      config.testEndDate = new Date(updateDto.testEndDate);
    } else {
      config.testEndDate = null;
    }

    const savedConfig = await this.systemConfigRepository.save(config);

    // 🆕 상태가 변경된 경우 SSE로 브로드캐스트
    if (wasTestMode !== config.isTestMode) {
      try {
        const newStatus = await this.getSystemStatus();
        this.statusUpdateSubject.next(newStatus);

        console.log(
          `✅ SSE 브로드캐스트 완료: 테스트 모드 ${config.isTestMode ? '활성화' : '비활성화'}, 활성 연결: ${this.activeConnections.size}`,
        );
      } catch (error) {
        console.error('SSE 브로드캐스트 실패:', error);
      }
    }

    return savedConfig;
  }

  // 테스트 모드 여부만 간단히 확인하는 헬퍼 메서드
  async isTestModeActive(): Promise<boolean> {
    const status = await this.getSystemStatus();
    return status.isTestMode;
  }

  // 🆕 활성 SSE 연결 수 확인
  getActiveConnectionsCount(): number {
    return this.activeConnections.size;
  }
}

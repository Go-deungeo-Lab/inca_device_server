// src/system/system.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { UpdateSystemConfigDto, SystemStatusDto } from './dto/system.dto';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
  ) {}

  // 시스템 설정 조회 (없으면 기본값 생성)
  async getSystemConfig(): Promise<SystemConfig> {
    let config = await this.systemConfigRepository.findOne({
      where: { id: 1 }, // 항상 ID 1을 사용
    });

    if (!config) {
      // 기본 설정 생성
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

    // 테스트 기간인지 확인
    let isInTestPeriod = config.isTestMode;

    if (config.isTestMode && config.testStartDate && config.testEndDate) {
      // 현재 시간이 테스트 기간 내에 있는지 확인
      isInTestPeriod = now >= config.testStartDate && now <= config.testEndDate;
    }

    return {
      isTestMode: isInTestPeriod,
      testMessage: config.testMessage,
      testStartDate: config.testStartDate,
      testEndDate: config.testEndDate,
      testType: config.testType,
      canRentDevices: !isInTestPeriod, // 테스트 모드가 아닐 때만 대여 가능
    };
  }

  // 🔒 관리자용 - 시스템 설정 업데이트
  async updateSystemConfig(updateDto: UpdateSystemConfigDto): Promise<SystemConfig> {
    const config = await this.getSystemConfig();

    // 데이터 업데이트
    config.isTestMode = updateDto.isTestMode;
    config.testMessage = updateDto.testMessage ?? null;
    config.testType = updateDto.testType ?? null;

    // 날짜 처리
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

    return this.systemConfigRepository.save(config);
  }

  // 테스트 모드 여부만 간단히 확인하는 헬퍼 메서드
  async isTestModeActive(): Promise<boolean> {
    const status = await this.getSystemStatus();
    return status.isTestMode;
  }
}
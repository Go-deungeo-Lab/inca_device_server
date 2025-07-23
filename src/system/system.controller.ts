// src/system/system.controller.ts - SSE 엔드포인트 추가
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SystemService } from './system.service';
import { UpdateSystemConfigDto, SystemStatusDto } from './dto/system.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SystemConfig } from './entities/system-config.entity';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // 🔓 공개 API - 시스템 상태 조회 (사용자용)
  @Get('status')
  async getSystemStatus(): Promise<SystemStatusDto> {
    return this.systemService.getSystemStatus();
  }

  // 🆕 SSE - 실시간 시스템 상태 스트림 (공개)
  @Sse('status/stream')
  streamSystemStatus(): Observable<MessageEvent> {
    return this.systemService.getStatusStream();
  }

  // 🔒 관리자용 - 전체 시스템 설정 조회
  @Get('config')
  @UseGuards(JwtAuthGuard)
  async getSystemConfig(): Promise<SystemConfig> {
    return this.systemService.getSystemConfig();
  }

  // 🔒 관리자용 - 시스템 설정 업데이트
  @Put('config')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateSystemConfig(@Body() updateDto: UpdateSystemConfigDto): Promise<{
    message: string;
    config: SystemConfig;
    activeConnections: number;
  }> {
    const config = await this.systemService.updateSystemConfig(updateDto);

    // SSE 연결 수 확인
    const activeConnections = this.systemService.getActiveConnectionsCount();

    return {
      message: updateDto.isTestMode
        ? `테스트 모드가 활성화되었습니다. 사용자 디바이스 대여가 제한됩니다. (${activeConnections}명에게 실시간 알림 전송)`
        : `테스트 모드가 비활성화되었습니다. 사용자 디바이스 대여가 가능합니다. (${activeConnections}명에게 실시간 알림 전송)`,
      config,
      activeConnections,
    };
  }

  // 🔒 관리자용 - 테스트 모드 빠른 토글
  @Put('test-mode/toggle')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleTestMode(): Promise<{
    message: string;
    isTestMode: boolean;
    activeConnections: number;
  }> {
    const currentConfig = await this.systemService.getSystemConfig();

    const updatedConfig = await this.systemService.updateSystemConfig({
      isTestMode: !currentConfig.isTestMode,
      testMessage: currentConfig.testMessage,
      testStartDate: currentConfig.testStartDate?.toISOString() ?? null,
      testEndDate: currentConfig.testEndDate?.toISOString() ?? null,
      testType: currentConfig.testType,
    });

    const activeConnections = this.systemService.getActiveConnectionsCount();

    return {
      message: updatedConfig.isTestMode
        ? `테스트 모드가 활성화되었습니다. (${activeConnections}명에게 실시간 알림 전송)`
        : `테스트 모드가 비활성화되었습니다. (${activeConnections}명에게 실시간 알림 전송)`,
      isTestMode: updatedConfig.isTestMode,
      activeConnections,
    };
  }

  // 🆕 SSE 연결 상태 확인 (관리자용)
  @Get('sse/status')
  @UseGuards(JwtAuthGuard)
  getSseStatus(): {
    activeConnections: number;
    isActive: boolean;
  } {
    const activeConnections = this.systemService.getActiveConnectionsCount();

    return {
      activeConnections,
      isActive: activeConnections > 0,
    };
  }
}

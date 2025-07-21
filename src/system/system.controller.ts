// src/system/system.controller.ts
import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
  async updateSystemConfig(
    @Body() updateDto: UpdateSystemConfigDto
  ): Promise<{
    message: string;
    config: SystemConfig;
  }> {
    const config = await this.systemService.updateSystemConfig(updateDto);

    return {
      message: updateDto.isTestMode
        ? '테스트 모드가 활성화되었습니다. 사용자 디바이스 대여가 제한됩니다.'
        : '테스트 모드가 비활성화되었습니다. 사용자 디바이스 대여가 가능합니다.',
      config,
    };
  }

  // 🔒 관리자용 - 테스트 모드 빠른 토글
  @Put('test-mode/toggle')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleTestMode(): Promise<{
    message: string;
    isTestMode: boolean;
  }> {
    const currentConfig = await this.systemService.getSystemConfig();

    const updatedConfig = await this.systemService.updateSystemConfig({
      isTestMode: !currentConfig.isTestMode,
      testMessage: currentConfig.testMessage,
      testStartDate: currentConfig.testStartDate?.toISOString() ?? null,
      testEndDate: currentConfig.testEndDate?.toISOString() ?? null,
      testType: currentConfig.testType,
    });

    return {
      message: updatedConfig.isTestMode
        ? '테스트 모드가 활성화되었습니다.'
        : '테스트 모드가 비활성화되었습니다.',
      isTestMode: updatedConfig.isTestMode,
    };
  }
}
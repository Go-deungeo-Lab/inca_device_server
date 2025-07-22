// src/system/dto/system.dto.ts
import { IsBoolean, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsBoolean()
  isTestMode: boolean;

  @IsOptional()
  @IsString()
  testMessage?: string | null;

  @IsOptional()
  @IsDateString()
  testStartDate?: string | null;

  @IsOptional()
  @IsDateString()
  testEndDate?: string | null;

  @IsOptional()
  @IsString()
  testType?: string | null; // "호환성 테스트", "인수 테스트" 등
}

export class SystemStatusDto {
  isTestMode: boolean;
  testMessage?: string | null;
  testStartDate?: Date | null;
  testEndDate?: Date | null;
  testType?: string | null;
  canRentDevices: boolean; // 대여 가능 여부
}

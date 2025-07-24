import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNumber,
  IsIn,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  deviceNumber: string; // "8", "I-2" 등

  @IsString()
  productName: string; // "Galaxy Note 9", "iPhone XR" 등

  @IsOptional()
  @IsString()
  modelName?: string; // "SM-N960N", "A2105" 등

  @IsString()
  osVersion: string; // "10.0", "14.6.0" 등

  @IsBoolean()
  isRootedOrJailbroken: boolean; // 루팅/탈옥 여부

  @IsIn(['Android', 'iOS'])
  platform: 'Android' | 'iOS';
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  deviceNumber?: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsOptional()
  @IsString()
  osVersion?: string;

  @IsOptional()
  @IsBoolean()
  isRootedOrJailbroken?: boolean;

  @IsOptional()
  @IsIn(['Android', 'iOS'])
  platform?: 'Android' | 'iOS';
}

export class RentDeviceDto {
  @IsArray()
  @IsNumber({}, { each: true })
  deviceIds: number[];

  @IsString()
  renterName: string;
}

export class ReturnDeviceDto {
  @IsString()
  renterName: string;

  @IsString()
  password: string;
}

export class ReturnMultipleDevicesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  deviceIds: number[]; //반납할 디바이스 ID 배열

  @IsString()
  renterName: string; //대여자이름
}

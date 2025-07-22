// src/devices/devices.module.ts (업데이트)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { Device } from './entities/device.entity';
import { Rental } from '../rentals/entities/rental.entity';
import { AuthModule } from '../auth/auth.module';
// SystemModule은 @Global()로 설정했으므로 import 불필요

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, Rental]),
    AuthModule, // AuthService를 사용하기 위해 필요
    // SystemModule 제거 - @Global()로 설정되어 자동으로 사용 가능
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService, TypeOrmModule],
})
export class DevicesModule {}

import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';  // 추가
import { AppService } from './app.service';        // 추가
import { DevicesModule } from './devices/devices.module';
import { RentalsModule } from './rentals/rentals.module';
import { DeviceSeedService } from './seeds/device-seed.service';
import { Device } from './devices/entities/device.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'device_management.db',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Device]),
    DevicesModule,
    RentalsModule,
  ],
  controllers: [AppController],  // 이 줄 추가
  providers: [AppService, DeviceSeedService],  // AppService 추가
})
export class AppModule implements OnModuleInit {
  constructor(private readonly deviceSeedService: DeviceSeedService) {}

  async onModuleInit() {
    await this.deviceSeedService.seedDevices();
  }
}

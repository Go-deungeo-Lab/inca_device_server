import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  providers: [DeviceSeedService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly deviceSeedService: DeviceSeedService) {}

  async onModuleInit() {
    await this.deviceSeedService.seedDevices();
  }
}
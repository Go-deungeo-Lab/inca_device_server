import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
      type: 'postgres',
      // Railway의 DATABASE_URL 사용 (우선순위)
      url: process.env.DATABASE_URL,
      // 또는 개별 환경변수 사용 (타입 안전성을 위해 기본값 제공)
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: process.env.POSTGRES_DB || 'device_management',
      autoLoadEntities: true,
      // 프로덕션에서는 synchronize 비활성화
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      // Railway PostgreSQL SSL 설정
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
    TypeOrmModule.forFeature([Device]),
    DevicesModule,
    RentalsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DeviceSeedService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly deviceSeedService: DeviceSeedService) {}

  async onModuleInit() {
    // 프로덕션에서도 DB가 비어있으면 초기 데이터 생성
    await this.deviceSeedService.seedDevices();
  }
}

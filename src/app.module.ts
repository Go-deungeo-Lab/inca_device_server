// src/app.module.ts (업데이트)
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { RentalsModule } from './rentals/rentals.module';
import { AuthModule } from './auth/auth.module';
import { SystemModule } from './system/system.module'; // 🆕 추가
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
      // 임시로 프로덕션에서도 synchronize 활성화 (첫 배포용)
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
      // Railway PostgreSQL SSL 설정
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    }),
    TypeOrmModule.forFeature([Device]), // SystemConfig 제거 (SystemModule에서 관리)
    SystemModule, // 🆕 먼저 추가
    AuthModule,
    DevicesModule,
    RentalsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DeviceSeedService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly deviceSeedService: DeviceSeedService) {}

  async onModuleInit() {
    // DB 연결이 완료된 후 시드 데이터 실행
    try {
      // 약간의 지연을 두어 DB 연결 완료 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await this.deviceSeedService.seedDevices();
    } catch (error) {
      console.error('Module initialization error:', error);
      // 오류가 발생해도 애플리케이션을 계속 실행
    }
  }
}
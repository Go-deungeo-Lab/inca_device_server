// src/system/system.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { SystemConfig } from './entities/system-config.entity';
import { AuthModule } from '../auth/auth.module';

@Global() // 🆕 Global 모듈로 설정
@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig]),
    AuthModule, // JWT 인증을 위해 필요
  ],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService], // 다른 모듈에서 사용할 수 있도록 export
})
export class SystemModule {}

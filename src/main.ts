import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정 추가
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://your-frontend-domain.com' // 프론트엔드 배포 도메인
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 전역 유효성 검사 파이프 추가
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

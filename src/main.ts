import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.log(`🚀 Starting application in ${process.env.NODE_ENV || 'development'} mode`);

  // IP 기반 접근 제한 (프로덕션에서만)
  const allowedIPs = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

  if (isProduction && allowedIPs.length > 0) {
    console.log('🔐 IP filtering enabled:', allowedIPs);

    app.use((req, res, next) => {
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip;

      const isAllowed = allowedIPs.some(allowedIP => {
        if (allowedIP.includes('/')) {
          return isIPInCIDR(clientIP, allowedIP);
        }
        return clientIP === allowedIP;
      });

      if (!isAllowed) {
        console.log(`🚫 Blocked IP: ${clientIP}`);
        return res.status(403).json({
          message: 'Access denied from this IP address',
          timestamp: new Date().toISOString()
        });
      }

      next();
    });
  }

  // CORS 설정 (환경변수로만 관리)
  const frontendUrls = process.env.FRONTEND_URLS?.split(',').map(url => url.trim()) || [];

  // 개발환경에서만 로컬호스트 자동 추가
  if (isDevelopment) {
    frontendUrls.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    );
  }

  // 프로덕션에서는 환경변수로만 CORS 도메인 관리
  console.log('🌐 CORS enabled for:', frontendUrls.length > 0 ? frontendUrls : ['all origins (development mode)']);

  app.enableCors({
    origin: frontendUrls.length > 0 ? frontendUrls : !isProduction, // 프로덕션에서는 환경변수 필수
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // 글로벌 파이프 설정
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: !isDevelopment,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`✅ Application is running on: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);

  if (frontendUrls.length > 0) {
    console.log(`🌐 CORS origins: ${frontendUrls.join(', ')}`);
  } else if (isProduction) {
    console.warn('⚠️  WARNING: No FRONTEND_URLS set in production! CORS will block all requests.');
  }

  if (isDevelopment) {
    console.log(`🧪 Test login: POST http://localhost:${port}/auth/login`);
    console.log(`📱 Available devices: GET http://localhost:${port}/devices/available`);
  }

  if (isProduction && allowedIPs.length > 0) {
    console.log('🔒 IP filtering active for:', allowedIPs);
  }
}

// CIDR 표기법 IP 범위 확인 함수
function isIPInCIDR(ip: string, cidr: string): boolean {
  try {
    const [network, prefixLength] = cidr.split('/');
    const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;

    const ipNum = ipToNumber(ip);
    const networkNum = ipToNumber(network);

    return (ipNum & mask) === (networkNum & mask);
  } catch (error) {
    console.error('CIDR parsing error:', error);
    return false;
  }
}

// IP 주소를 숫자로 변환
function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

bootstrap().catch(error => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
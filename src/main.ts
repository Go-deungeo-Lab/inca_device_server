import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 허용된 IP 주소들 (환경 변수에서 가져오기)
  const allowedIPs = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
  const isProduction = process.env.NODE_ENV === 'production';
  
  // IP 기반 접근 제한 미들웨어
  if (isProduction && allowedIPs.length > 0) {
    app.use((req, res, next) => {
      // 클라이언트 IP 추출 (프록시 환경 고려)
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                       req.headers['x-real-ip'] || 
                       req.connection.remoteAddress || 
                       req.socket.remoteAddress ||
                       req.ip;
      
      console.log(`접속 시도 IP: ${clientIP}`);
      
      // IP 허용 목록 확인
      const isAllowed = allowedIPs.some(allowedIP => {
        // CIDR 표기법 지원 (예: 192.168.1.0/24)
        if (allowedIP.includes('/')) {
          return isIPInCIDR(clientIP, allowedIP);
        }
        // 정확한 IP 매칭
        return clientIP === allowedIP;
      });
      
      if (!isAllowed) {
        console.log(`차단된 IP: ${clientIP}`);
        return res.status(403).json({ 
          message: 'Access denied from this IP address',
          ip: clientIP,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`허용된 IP: ${clientIP}`);
      next();
    });
  }
  
  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://inca-device-view.vercel.app',
      'https://inca-device-view-admin.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  
  if (isProduction) {
    console.log('Production mode - IP filtering enabled');
    console.log('Allowed IPs:', allowedIPs);
  } else {
    console.log('Development mode - IP filtering disabled');
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

bootstrap();

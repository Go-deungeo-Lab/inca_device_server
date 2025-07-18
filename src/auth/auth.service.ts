import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface User {
  username: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    username: string;
    role: string;
  };
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly adminUsername: string;
  private readonly adminPassword: string;

  constructor(private readonly configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET',
      'your-secret-key',
    );
    this.adminUsername = this.configService.get<string>(
      'ADMIN_USERNAME',
      'incaqa001',
    );
    this.adminPassword = this.configService.get<string>(
      'ADMIN_PASSWORD',
      '!incasys11',
    );
  }

  validateUser(username: string, password: string): User | null {
    // 관리자 계정 확인
    if (username === this.adminUsername && password === this.adminPassword) {
      return {
        username: this.adminUsername,
        role: 'manager',
      };
    }

    return null;
  }

  login(user: User): LoginResponse {
    const payload = {
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '24h',
    });

    return {
      access_token: token,
      user: {
        username: user.username,
        role: user.role,
      },
      expiresIn: 24 * 60 * 60, // 24시간 (초 단위)
    };
  }

  verifyToken(token: string): boolean {
    try {
      jwt.verify(token, this.jwtSecret);
      return true;
    } catch (error) {
      return false;
    }
  }

  decodeToken(token: string): jwt.JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      if (typeof decoded === 'string') {
        throw new Error('Invalid token format');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

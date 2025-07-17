// src/seeds/device-seed.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../devices/entities/device.entity';

@Injectable()
export class DeviceSeedService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async seedDevices(): Promise<void> {
    try {
      // 테이블 존재 여부와 데이터 확인을 안전하게 처리
      const existingDevices = await this.deviceRepository
        .count()
        .catch(() => 0);

      if (existingDevices > 0) {
        console.log(
          '디바이스 데이터가 이미 존재합니다. 시드 작업을 건너뜁니다.',
        );
        return;
      }

      console.log('초기 디바이스 데이터를 생성합니다...');

      const deviceData = [
        // Android 디바이스들
        {
          deviceNumber: '8',
          productName: 'Galaxy Note 9',
          modelName: 'SM-N960N',
          osVersion: '10.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '11',
          productName: 'Galaxy Tab S6 Lite',
          modelName: 'SM-P615N',
          osVersion: '12.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '14',
          productName: 'Xperia Ace 2',
          modelName: 'SO-41B',
          osVersion: '13.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '21',
          productName: 'Galaxy S24',
          modelName: 'SM-S921N',
          osVersion: '15.0',
          isRootedOrJailbroken: false,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '24',
          productName: 'Galaxy S23',
          modelName: 'SM-S911N',
          osVersion: '14.0',
          isRootedOrJailbroken: true,
          platform: 'Android' as const,
        },
        {
          deviceNumber: '26',
          productName: 'Pixel 8',
          modelName: 'G9BQD',
          osVersion: '16.0',
          isRootedOrJailbroken: true,
          platform: 'Android' as const,
        },
        // iOS 디바이스들
        {
          deviceNumber: 'I-2',
          productName: 'iPhone XR',
          modelName: 'A2105',
          osVersion: '14.6.0',
          isRootedOrJailbroken: true,
          platform: 'iOS' as const,
        },
        {
          deviceNumber: 'I-3',
          productName: 'iPhone 7',
          modelName: 'A1778',
          osVersion: '14.7.1',
          isRootedOrJailbroken: true,
          platform: 'iOS' as const,
        },
        {
          deviceNumber: 'I-5',
          productName: 'iPhone 12 mini',
          modelName: 'A2399',
          osVersion: '15.1.0',
          isRootedOrJailbroken: true,
          platform: 'iOS' as const,
        },
        {
          deviceNumber: 'I-14',
          productName: 'iPhone 14 Plus',
          modelName: 'A2886',
          osVersion: '18.5.0',
          isRootedOrJailbroken: false,
          platform: 'iOS' as const,
        },
      ];

      const devices = this.deviceRepository.create(deviceData);
      await this.deviceRepository.save(devices);

      console.log(
        `${devices.length}개의 디바이스 데이터가 성공적으로 저장되었습니다.`,
      );
    } catch (error) {
      console.error('시드 데이터 생성 중 오류 발생:', error);
      // 오류가 발생해도 애플리케이션 시작을 막지 않음
    }
  }
}

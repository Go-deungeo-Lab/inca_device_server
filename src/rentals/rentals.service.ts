import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from './entities/rental.entity';
import { Device } from '../devices/entities/device.entity';

@Injectable()
export class RentalsService {
    constructor(
        @InjectRepository(Rental)
        private rentalRepository: Repository<Rental>,
        @InjectRepository(Device)
        private deviceRepository: Repository<Device>,
    ) {}

    // 모든 대여 기록 조회
    async findAll(): Promise<Rental[]> {
        return this.rentalRepository.find({
            relations: ['device'],
            order: { rentedAt: 'DESC' },
        });
    }

    // 활성 대여 기록 조회 (현재 대여 중인 것들)
    async findActiveRentals(): Promise<Rental[]> {
        return this.rentalRepository.find({
            where: { status: 'active' },
            relations: ['device'],
            order: { rentedAt: 'DESC' },
        });
    }

    // 반납된 대여 기록 조회
    async findReturnedRentals(): Promise<Rental[]> {
        return this.rentalRepository.find({
            where: { status: 'returned' },
            relations: ['device'],
            order: { returnedAt: 'DESC' },
        });
    }

    // 특정 대여 기록 조회
    async findOne(id: number): Promise<Rental> {
        const rental = await this.rentalRepository.findOne({
            where: { id },
            relations: ['device'],
        });

        if (!rental) {
            throw new NotFoundException(`Rental with ID ${id} not found`);
        }

        return rental;
    }

    // 특정 사용자의 대여 기록 조회
    async findByRenterName(renterName: string): Promise<Rental[]> {
        return this.rentalRepository.find({
            where: { renterName },
            relations: ['device'],
            order: { rentedAt: 'DESC' },
        });
    }

    // 특정 사용자의 활성 대여 기록 조회
    async findActiveRentalsByRenter(renterName: string): Promise<Rental[]> {
        return this.rentalRepository.find({
            where: {
                renterName,
                status: 'active'
            },
            relations: ['device'],
            order: { rentedAt: 'DESC' },
        });
    }

    // 특정 디바이스의 대여 기록 조회
    async findByDeviceId(deviceId: number): Promise<Rental[]> {
        return this.rentalRepository.find({
            where: { deviceId },
            relations: ['device'],
            order: { rentedAt: 'DESC' },
        });
    }

    // 특정 디바이스의 현재 활성 대여 기록 조회
    async findActiveRentalByDevice(deviceId: number): Promise<Rental | null> {
        return this.rentalRepository.findOne({
            where: {
                deviceId,
                status: 'active'
            },
            relations: ['device'],
        });
    }

    // 대여 기록 삭제 (관리자용)
    async remove(id: number): Promise<void> {
        const rental = await this.findOne(id);
        await this.rentalRepository.remove(rental);
    }

    // 대여 통계 조회
    async getRentalStats(): Promise<{
        totalRentals: number;
        activeRentals: number;
        returnedRentals: number;
        uniqueRenters: number;
    }> {
        const totalRentals = await this.rentalRepository.count();
        const activeRentals = await this.rentalRepository.count({
            where: { status: 'active' }
        });
        const returnedRentals = await this.rentalRepository.count({
            where: { status: 'returned' }
        });

        // 고유 대여자 수 계산
        const renters = await this.rentalRepository
            .createQueryBuilder('rental')
            .select('DISTINCT rental.renterName')
            .getRawMany();

        const uniqueRenters = renters.length;

        return {
            totalRentals,
            activeRentals,
            returnedRentals,
            uniqueRenters,
        };
    }

    // 플랫폼별 대여 통계
    async getRentalStatsByPlatform(): Promise<{
        android: { active: number; total: number };
        ios: { active: number; total: number };
    }> {
        // Android 통계
        const androidActive = await this.rentalRepository
            .createQueryBuilder('rental')
            .leftJoin('rental.device', 'device')
            .where('device.platform = :platform', { platform: 'Android' })
            .andWhere('rental.status = :status', { status: 'active' })
            .getCount();

        const androidTotal = await this.rentalRepository
            .createQueryBuilder('rental')
            .leftJoin('rental.device', 'device')
            .where('device.platform = :platform', { platform: 'Android' })
            .getCount();

        // iOS 통계
        const iosActive = await this.rentalRepository
            .createQueryBuilder('rental')
            .leftJoin('rental.device', 'device')
            .where('device.platform = :platform', { platform: 'iOS' })
            .andWhere('rental.status = :status', { status: 'active' })
            .getCount();

        const iosTotal = await this.rentalRepository
            .createQueryBuilder('rental')
            .leftJoin('rental.device', 'device')
            .where('device.platform = :platform', { platform: 'iOS' })
            .getCount();

        return {
            android: { active: androidActive, total: androidTotal },
            ios: { active: iosActive, total: iosTotal },
        };
    }
}
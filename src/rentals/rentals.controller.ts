import {
    Controller,
    Get,
    Param,
    Delete,
    ParseIntPipe
} from '@nestjs/common';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
    constructor(private readonly rentalsService: RentalsService) {}

    // 모든 대여 기록 조회
    @Get()
    findAll() {
        return this.rentalsService.findAll();
    }

    // 활성 대여 기록 조회 (현재 대여 중)
    @Get('active')
    findActiveRentals() {
        return this.rentalsService.findActiveRentals();
    }

    // 반납된 대여 기록 조회
    @Get('returned')
    findReturnedRentals() {
        return this.rentalsService.findReturnedRentals();
    }

    // 대여 통계 조회
    @Get('stats')
    getRentalStats() {
        return this.rentalsService.getRentalStats();
    }

    // 플랫폼별 대여 통계
    @Get('stats/platform')
    getRentalStatsByPlatform() {
        return this.rentalsService.getRentalStatsByPlatform();
    }

    // 특정 사용자의 대여 기록 조회
    @Get('renter/:renterName')
    findByRenterName(@Param('renterName') renterName: string) {
        return this.rentalsService.findByRenterName(renterName);
    }

    // 특정 사용자의 활성 대여 기록 조회
    @Get('renter/:renterName/active')
    findActiveRentalsByRenter(@Param('renterName') renterName: string) {
        return this.rentalsService.findActiveRentalsByRenter(renterName);
    }

    // 특정 디바이스의 대여 기록 조회
    @Get('device/:deviceId')
    findByDeviceId(@Param('deviceId', ParseIntPipe) deviceId: number) {
        return this.rentalsService.findByDeviceId(deviceId);
    }

    // 특정 디바이스의 현재 활성 대여 기록 조회
    @Get('device/:deviceId/active')
    findActiveRentalByDevice(@Param('deviceId', ParseIntPipe) deviceId: number) {
        return this.rentalsService.findActiveRentalByDevice(deviceId);
    }

    // 특정 대여 기록 조회
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rentalsService.findOne(id);
    }

    // 대여 기록 삭제 (관리자용)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.rentalsService.remove(id);
    }
}
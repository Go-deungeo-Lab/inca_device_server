import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  RentDeviceDto,
  ReturnDeviceDto, ReturnMultipleDevicesDto,
} from './dto/devices.dto';
import { QaPasswordGuard } from '../common/guards/qa-password.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // 🔓 공개 API (사용자용) - 인증 불필요

  // 모든 디바이스 조회 (사용자용 - 상태 정보 포함)
  @Get('all')
  getAllDevicesForUser() {
    return this.devicesService.findAllForUser();
  }

  // 대여 가능한 디바이스만 조회 (사용자용)
  @Get('available')
  getAvailableDevices() {
    return this.devicesService.getAvailableDevices();
  }

  // 디바이스 대여 (사용자용)
  @Post('rent')
  rentDevices(@Body() rentDeviceDto: RentDeviceDto) {
    return this.devicesService.rentDevices(rentDeviceDto);
  }

  // 사용자별 대여중인 디바이스 조회 (사용자용)
  @Get('user/:renterName/rented')
  getUserRentedDevices(@Param('renterName') renterName: string) {
    return this.devicesService.getUserRentedDevices(renterName);
  }

  // ✅ 사용자 디바이스 반납 (이름만 입력하면 OK - QA 비밀번호 제거)
  @Post('user-return/:id')
  userReturnDevice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { renterName: string },
  ) {
    return this.devicesService.returnDevice(id, body.renterName);
  }

  // 사용자 디바이스 일괄 반납
  @Post('user-return-multiple')
  userReturnMultipleDevices(@Body() returnDto: ReturnMultipleDevicesDto) {
    return this.devicesService.returnMultipleDevices(returnDto);
  }

  // 특정 디바이스 조회 (사용자용)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.findOne(id);
  }

  // 🔒 관리자 전용 API (JWT 인증 필요)

  // 모든 디바이스 조회 (관리자용 - 상세 정보 포함)
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.devicesService.findAllForAdmin();
  }

  // 대여 중인 디바이스 조회 (관리자용)
  @Get('admin/rented')
  @UseGuards(JwtAuthGuard)
  getRentedDevices() {
    return this.devicesService.getRentedDevices();
  }

  // 디바이스 생성 (관리자용)
  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  // 디바이스 수정 (관리자용)
  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  // 디바이스 삭제 (관리자용)
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.remove(id);
  }

  // 관리자용 디바이스 반납 (JWT + QA 비밀번호 필요)
  @Post('admin/return/:id')
  @UseGuards(JwtAuthGuard, QaPasswordGuard)
  adminReturnDevice(
    @Param('id', ParseIntPipe) id: number,
    @Body() returnDeviceDto: ReturnDeviceDto,
  ) {
    return this.devicesService.returnDevice(id, returnDeviceDto.renterName);
  }


}

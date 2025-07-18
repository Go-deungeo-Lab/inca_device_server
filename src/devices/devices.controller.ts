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
  ReturnDeviceDto,
} from './dto/devices.dto';
import { QaPasswordGuard } from '../common/guards/qa-password.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // 🔓 공개 API (사용자용) - 구체적인 라우트를 먼저 정의

  // 대여 가능한 디바이스 조회 (공개)
  @Get('available')
  getAvailableDevices() {
    return this.devicesService.getAvailableDevices();
  }

  // 대여 중인 디바이스 조회 (매니저 전용)
  @Get('rented')
  @UseGuards(JwtAuthGuard)
  getRentedDevices() {
    return this.devicesService.getRentedDevices();
  }

  // 디바이스 대여 (공개)
  @Post('rent')
  rentDevices(@Body() rentDeviceDto: RentDeviceDto) {
    return this.devicesService.rentDevices(rentDeviceDto);
  }

  // 사용자별 대여중인 디바이스 조회 (공개)
  @Get('user/:renterName/rented')
  getUserRentedDevices(@Param('renterName') renterName: string) {
    return this.devicesService.getUserRentedDevices(renterName);
  }

  // 사용자 디바이스 반납 (QA 비밀번호만 필요)
  @Post('user-return/:id')
  @UseGuards(QaPasswordGuard)
  userReturnDevice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { renterName: string; password: string },
  ) {
    return this.devicesService.returnDevice(id, body.renterName);
  }

  // 매니저 디바이스 반납 (JWT + QA 비밀번호 필요)
  @Post('return/:id')
  @UseGuards(JwtAuthGuard, QaPasswordGuard)
  returnDevice(
    @Param('id', ParseIntPipe) id: number,
    @Body() returnDeviceDto: ReturnDeviceDto,
  ) {
    return this.devicesService.returnDevice(id, returnDeviceDto.renterName);
  }

  // 🔒 매니저 전용 API (JWT 인증 필요)

  // 모든 디바이스 조회 (매니저 전용) - 동적 라우트보다 먼저 배치!
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.devicesService.findAll();
  }

  // 디바이스 생성 (매니저 전용)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  // ⚠️ 중요: 동적 라우트는 가장 마지막에 배치
  // 특정 디바이스 조회 (공개)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.findOne(id);
  }

  // 디바이스 수정 (매니저 전용)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  // 디바이스 삭제 (매니저 전용)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.remove(id);
  }
}
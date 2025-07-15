import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, RentDeviceDto, ReturnDeviceDto } from './dto/devices.dto';
import { QaPasswordGuard } from '../common/guards/qa-password.guard';

@Controller('devices')
export class DevicesController {
    constructor(private readonly devicesService: DevicesService) {}

    // 모든 디바이스 조회
    @Get()
    findAll() {
        return this.devicesService.findAll();
    }

    // 대여 가능한 디바이스 조회
    @Get('available')
    getAvailableDevices() {
        return this.devicesService.getAvailableDevices();
    }

    // 대여 중인 디바이스 조회
    @Get('rented')
    getRentedDevices() {
        return this.devicesService.getRentedDevices();
    }

    // 특정 디바이스 조회
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.devicesService.findOne(id);
    }

    // 디바이스 생성 (Manager용)
    @Post()
    create(@Body() createDeviceDto: CreateDeviceDto) {
        return this.devicesService.create(createDeviceDto);
    }

    // 디바이스 수정 (Manager용)
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDeviceDto: UpdateDeviceDto
    ) {
        return this.devicesService.update(id, updateDeviceDto);
    }

    // 디바이스 삭제 (Manager용)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.devicesService.remove(id);
    }

    // 디바이스 대여 (User용)
    @Post('rent')
    rentDevices(@Body() rentDeviceDto: RentDeviceDto) {
        return this.devicesService.rentDevices(rentDeviceDto);
    }

    // 디바이스 반납 (QA 비밀번호 필요)
    @Post('return/:id')
    @UseGuards(QaPasswordGuard)
    returnDevice(
        @Param('id', ParseIntPipe) id: number,
        @Body() returnDeviceDto: ReturnDeviceDto
    ) {
        return this.devicesService.returnDevice(id, returnDeviceDto.renterName);
    }
}
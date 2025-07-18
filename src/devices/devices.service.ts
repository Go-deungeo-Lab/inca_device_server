import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { Rental } from '../rentals/entities/rental.entity';
import {
  CreateDeviceDto,
  UpdateDeviceDto,
  RentDeviceDto,
} from './dto/devices.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>,
  ) {}

  // 🔓 사용자용 - 모든 디바이스 조회 (기본 정보만)
  async findAllForUser(): Promise<Device[]> {
    return this.deviceRepository.find({
      select: [
        'id',
        'deviceNumber',
        'productName',
        'modelName',
        'osVersion',
        'platform',
        'isRootedOrJailbroken',
        'status',
        'currentRenter'
      ],
      order: {
        status: 'ASC', // available이 먼저 오도록
        id: 'ASC'
      },
    });
  }

  // 🔒 관리자용 - 모든 디바이스 조회 (상세 정보 포함)
  async findAllForAdmin(): Promise<Device[]> {
    return this.deviceRepository.find({
      relations: ['rentals'],
      order: { id: 'ASC' },
    });
  }

  // 디바이스 ID로 조회 (공개)
  async findOne(id: number): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { id },
      select: [
        'id',
        'deviceNumber',
        'productName',
        'modelName',
        'osVersion',
        'platform',
        'isRootedOrJailbroken',
        'status',
        'currentRenter'
      ],
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return device;
  }

  // 🔒 관리자용 - 디바이스 생성
  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    // 중복 디바이스 번호 확인
    const existingDevice = await this.deviceRepository.findOne({
      where: { deviceNumber: createDeviceDto.deviceNumber },
    });

    if (existingDevice) {
      throw new BadRequestException('Device number already exists');
    }

    const device = this.deviceRepository.create(createDeviceDto);
    return this.deviceRepository.save(device);
  }

  // 🔒 관리자용 - 디바이스 수정
  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.deviceRepository.findOne({ where: { id } });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // 디바이스 번호 중복 확인 (다른 디바이스와)
    if (updateDeviceDto.deviceNumber) {
      const existingDevice = await this.deviceRepository.findOne({
        where: { deviceNumber: updateDeviceDto.deviceNumber },
      });

      if (existingDevice && existingDevice.id !== id) {
        throw new BadRequestException('Device number already exists');
      }
    }

    Object.assign(device, updateDeviceDto);
    return this.deviceRepository.save(device);
  }

  // 🔒 관리자용 - 디바이스 삭제
  async remove(id: number): Promise<void> {
    const device = await this.deviceRepository.findOne({ where: { id } });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    // 대여 중인 디바이스는 삭제 불가
    if (device.status === 'rented') {
      throw new BadRequestException('Cannot delete rented device');
    }

    await this.deviceRepository.remove(device);
  }

  // 🔓 사용자용 - 디바이스 대여
  async rentDevices(rentDeviceDto: RentDeviceDto): Promise<Device[]> {
    const { deviceIds, renterName } = rentDeviceDto;
    const rentedDevices: Device[] = [];

    for (const deviceId of deviceIds) {
      const device = await this.deviceRepository.findOne({ where: { id: deviceId } });

      if (!device) {
        throw new NotFoundException(`Device with ID ${deviceId} not found`);
      }

      if (device.status === 'rented') {
        throw new BadRequestException(
          `Device ${device.deviceNumber} is already rented`,
        );
      }

      // 디바이스 상태 업데이트
      device.status = 'rented';
      device.currentRenter = renterName;
      const savedDevice = await this.deviceRepository.save(device);

      // 대여 기록 생성
      const rental = this.rentalRepository.create({
        renterName,
        deviceId: device.id,
        status: 'active',
      });
      await this.rentalRepository.save(rental);

      rentedDevices.push(savedDevice);
    }

    return rentedDevices;
  }

  // 🔓 사용자용 - 디바이스 반납
  async returnDevice(deviceId: number, renterName: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({ where: { id: deviceId } });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    if (device.status !== 'rented') {
      throw new BadRequestException('Device is not currently rented');
    }

    if (device.currentRenter !== renterName) {
      throw new BadRequestException('Renter name does not match');
    }

    // 활성 대여 기록 찾기
    const activeRental = await this.rentalRepository.findOne({
      where: {
        deviceId: device.id,
        status: 'active',
        renterName: renterName,
      },
    });

    if (!activeRental) {
      throw new BadRequestException('No active rental found');
    }

    // 대여 기록 업데이트
    activeRental.status = 'returned';
    activeRental.returnedAt = new Date();
    await this.rentalRepository.save(activeRental);

    // 디바이스 상태 업데이트
    device.status = 'available';
    device.currentRenter = null;
    await this.deviceRepository.save(device);

    return device;
  }

  // 🔓 사용자용 - 대여 가능한 디바이스 조회
  async getAvailableDevices(): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { status: 'available' },
      select: [
        'id',
        'deviceNumber',
        'productName',
        'modelName',
        'osVersion',
        'platform',
        'isRootedOrJailbroken',
        'status'
      ],
      order: { id: 'ASC' },
    });
  }

  // 🔒 관리자용 - 대여 중인 디바이스 조회
  async getRentedDevices(): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { status: 'rented' },
      relations: ['rentals'],
      order: { id: 'ASC' },
    });
  }

  // 🔓 사용자용 - 사용자별 대여중인 디바이스 조회
  async getUserRentedDevices(renterName: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: {
        status: 'rented',
        currentRenter: renterName,
      },
      select: [
        'id',
        'deviceNumber',
        'productName',
        'modelName',
        'osVersion',
        'platform',
        'isRootedOrJailbroken',
        'status',
        'currentRenter'
      ],
      order: { id: 'ASC' },
    });
  }
}
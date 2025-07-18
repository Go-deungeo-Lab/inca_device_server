import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';
import { Rental } from './entities/rental.entity';
import { Device } from '../devices/entities/device.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rental, Device]),
    AuthModule, // AuthService를 사용하기 위해 필요
  ],
  controllers: [RentalsController],
  providers: [RentalsService],
  exports: [RentalsService, TypeOrmModule],
})
export class RentalsModule {}

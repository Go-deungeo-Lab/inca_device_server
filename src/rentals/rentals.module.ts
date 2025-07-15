import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalsController } from './rentals.controller';
import { RentalsService } from './rentals.service';
import { Rental } from './entities/rental.entity';
import { Device } from '../devices/entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rental, Device])],
  controllers: [RentalsController],
  providers: [RentalsService],
  exports: [RentalsService, TypeOrmModule],
})
export class RentalsModule {}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { RentalsModule } from './rentals/rentals.module';

@Module({
  imports: [DevicesModule, RentalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

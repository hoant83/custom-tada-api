import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminRepository,
      DriverRepository,
      TruckOwnerRepository,
      CustomerRepository,
      NotificationInstance,
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}

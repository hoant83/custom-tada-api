import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { SmsSendModule } from 'src/modules/default/sms/sms.module';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { NotificationRepository } from 'src/repositories/notification.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminRepository,
      CustomerRepository,
      DriverRepository,
      TruckOwnerRepository,
      Notification,
      NotificationInstance,
      NotificationRepository,
    ]),
    SmsSendModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class AdminNotificationModule {}

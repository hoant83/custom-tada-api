import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileHelper } from 'src/common/helpers/file.helper';
import { MailHelper } from 'src/common/helpers/mail.helper';
import { PriceHelper } from 'src/common/helpers/price.helper';
import { SMSHelper } from 'src/common/helpers/sms.helper';
import { TemplatesService } from 'src/common/modules/email-templates/template.service';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { Commission } from 'src/entities/commission/commission.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { File } from 'src/entities/file/file.entity';
import { Note } from 'src/entities/note/note.entity';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { Province } from 'src/entities/province/province.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { FolderRepository } from 'src/repositories/folder.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { PricingRepository } from 'src/repositories/pricing.repository';
import { SettingRepository } from 'src/repositories/setting.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { NotificationService } from '../../admin/notification/notification.service';
import { SmsSendModule } from '../sms/sms.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderRepository,
      Truck,
      Driver,
      SettingRepository,
      Province,
      File,
      CustomerRepository,
      AdminRepository,
      TruckOwnerRepository,
      FolderRepository,
      Note,
      NotificationInstance,
      Notification,
      OtpLog,
      PricingRepository,
      DynamicCharges,
      TruckOwnerBankAccount,
      AdditionalPrice,
      AdminSetting,
      Tracking,
      DefaultPayment,
      Commission,
    ]),
    HttpModule,
    SmsSendModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    FileHelper,
    MailHelper,
    TemplatesService,
    LanguageService,
    NotificationService,
    SMSHelper,
    PriceHelper,
  ],
})
export class OrderModule {}

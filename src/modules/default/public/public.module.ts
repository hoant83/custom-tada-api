import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { ApiKey } from 'src/entities/api-key/api-key.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { OrderService } from '../order/order.service';
import { Truck } from 'src/entities/truck/truck.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { Province } from 'src/entities/province/province.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { File } from 'src/entities/file/file.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { FileHelper } from 'src/common/helpers/file.helper';
import { Note } from 'src/entities/note/note.entity';
import { MailHelper } from 'src/common/helpers/mail.helper';
import { NotificationService } from '../../admin/notification/notification.service';
import { SMSHelper } from 'src/common/helpers/sms.helper';
import { SmsSendModule } from '../sms/sms.module';
import { PricingRepository } from 'src/repositories/pricing.repository';
import { PriceHelper } from 'src/common/helpers/price.helper';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { TemplatesService } from 'src/common/modules/email-templates/template.service';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { SettingRepository } from 'src/repositories/setting.repository';
import { Commission } from 'src/entities/commission/commission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiKey,
      Customer,
      Truck,
      Driver,
      Province,
      AdminRepository,
      TruckOwnerRepository,
      OrderRepository,
      File,
      Folder,
      Note,
      SettingRepository,
      PricingRepository,
      DynamicCharges,
      TruckOwnerBankAccount,
      AdditionalPrice,
      AdminSetting,
      Tracking,
      DefaultPayment,
      NotificationInstance,
      Notification,
      OtpLog,
      Commission,
    ]),
    HttpModule,
    SmsSendModule,
  ],
  controllers: [PublicController],
  providers: [
    PublicService,
    OrderService,
    FileHelper,
    MailHelper,
    NotificationService,
    SMSHelper,
    PriceHelper,
    TemplatesService,
    LanguageService,
  ],
})
export class PublicModule {}

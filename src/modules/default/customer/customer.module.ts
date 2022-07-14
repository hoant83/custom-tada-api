import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileHelper } from 'src/common/helpers/file.helper';
import { MailHelper } from 'src/common/helpers/mail.helper';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { PriceHelper } from 'src/common/helpers/price.helper';
import { SMSHelper } from 'src/common/helpers/sms.helper';
import { TokenHelper } from 'src/common/helpers/token.helper';
import { AuditLogRepository } from 'src/common/modules/audit-logs/audit-log.repository';
import { AuditLogService } from 'src/common/modules/audit-logs/audit-log.service';
import { TemplatesService } from 'src/common/modules/email-templates/template.service';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { Commission } from 'src/entities/commission/commission.entity';
import { Company } from 'src/entities/company/company.entity';
import { DefaultReference } from 'src/entities/default-reference/default-reference.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { File } from 'src/entities/file/file.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { Note } from 'src/entities/note/note.entity';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { Province } from 'src/entities/province/province.entity';
import { Settings } from 'src/entities/setting/setting.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CompanyRepository } from 'src/repositories/company.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { PricingRepository } from 'src/repositories/pricing.repository';
import { SettingRepository } from 'src/repositories/setting.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { NotificationService } from '../../admin/notification/notification.service';
import { OrderService } from '../order/order.service';
import { SmsSendModule } from '../sms/sms.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      File,
      Company,
      TruckOwnerRepository,
      OrderRepository,
      Truck,
      Driver,
      SettingRepository,
      Province,
      CompanyRepository,
      Folder,
      AdminRepository,
      CustomerRepository,
      Note,
      Notification,
      NotificationInstance,
      AuditLogRepository,
      OtpLog,
      Settings,
      DefaultReference,
      DefaultPayment,
      PricingRepository,
      DynamicCharges,
      TruckOwnerBankAccount,
      AdditionalPrice,
      AdminSetting,
      Tracking,
      Commission,
    ]),
    HttpModule,
    SmsSendModule,
  ],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    OrderService,
    PasswordHelper,
    FileHelper,
    MailHelper,
    TokenHelper,
    TemplatesService,
    LanguageService,
    NotificationService,
    AuditLogService,
    SMSHelper,
    PriceHelper,
  ],
})
export class CustomerModule {}

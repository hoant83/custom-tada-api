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
import { Company } from 'src/entities/company/company.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { File } from 'src/entities/file/file.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { Note } from 'src/entities/note/note.entity';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { Province } from 'src/entities/province/province.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CompanyRepository } from 'src/repositories/company.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { PricingRepository } from 'src/repositories/pricing.repository';
import { TruckRepository } from 'src/repositories/truck.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { NotificationService } from '../../admin/notification/notification.service';
import { OrderService } from '../order/order.service';
import { SmsSendModule } from '../sms/sms.module';
import { TruckOwnerController } from './truckOwner.controller';
import { TruckOwnerService } from './truckOwner.service';
import { BlackBoxService } from '../black-box/black-box.service';
import { BlackBox } from 'src/entities/black-box/black-box.entity';
import { TrackingBlackBox } from 'src/entities/tracking-black-box/tracking-black-box.entity';
import { TrackingBlackBoxLog } from 'src/entities/tracking-black-box-log/tracking-black-box-log.entity';
import { DinhViHopQuyService } from '../black-box/dinhvihopquy.service';
import { AnTeckService } from '../black-box/anteck.service';
import { VietmapService } from '../black-box/vietmap.service';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { Commission } from 'src/entities/commission/commission.entity';
import { SettingRepository } from 'src/repositories/setting.repository';
import { DriverPaymentHistoryRepository } from 'src/repositories/driver-payment-history.repository';
import { Otp } from 'src/entities/otp/otp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TruckOwnerRepository,
      File,
      Company,
      Truck,
      TruckRepository,
      DriverRepository,
      OrderRepository,
      Province,
      CustomerRepository,
      Tracking,
      CompanyRepository,
      Folder,
      AdminRepository,
      Note,
      Notification,
      NotificationInstance,
      AuditLogRepository,
      OtpLog,
      SettingRepository,
      PricingRepository,
      TruckOwnerBankAccount,
      DynamicCharges,
      AdditionalPrice,
      AdminSetting,
      TrackingBlackBox,
      TrackingBlackBoxLog,
      BlackBox,
      DefaultPayment,
      Commission,
      DriverPaymentHistoryRepository,
      Otp,
    ]),
    HttpModule,
    SmsSendModule,
  ],
  controllers: [TruckOwnerController],
  providers: [
    TruckOwnerService,
    PasswordHelper,
    FileHelper,
    MailHelper,
    TokenHelper,
    OrderService,
    TemplatesService,
    LanguageService,
    NotificationService,
    AuditLogService,
    SMSHelper,
    PriceHelper,
    BlackBoxService,
    DinhViHopQuyService,
    AnTeckService,
    VietmapService,
  ],
})
export class TruckOwnerModule {}

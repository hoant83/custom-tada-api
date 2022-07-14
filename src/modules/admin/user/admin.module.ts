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
import { DistancePrice } from 'src/entities/distance-price/distance-price.entity';
import { Distance } from 'src/entities/distance/distance.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { File } from 'src/entities/file/file.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { MultipleStopsCharges } from 'src/entities/multiple-stops-price/multiple-stops-price.entity';
import { Note } from 'src/entities/note/note.entity';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { Order } from 'src/entities/order/order.entity';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { PayloadFare } from 'src/entities/payload-fare/payload-fare.entity';
import { Province } from 'src/entities/province/province.entity';
import { SpecialRequest } from 'src/entities/special-request/special-request.entity';
import { SurCharges } from 'src/entities/surcharges/surcharges.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { TruckTypeFare } from 'src/entities/truck-type-fare/truck-type-fare.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { ZonePrice } from 'src/entities/zone-price/zone-price.entity';
import { OrderService } from 'src/modules/default/order/order.service';
import { SmsSendModule } from 'src/modules/default/sms/sms.module';
import { TruckOwnerService } from 'src/modules/default/truckOwner/truckOwner.service';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CompanyRepository } from 'src/repositories/company.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { PricingRepository } from 'src/repositories/pricing.repository';
import { TruckRepository } from 'src/repositories/truck.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { NotificationService } from '../notification/notification.service';
import { AdminUserController } from './admin.controller';
import { AdminUserService } from './admin.service';
import { BlackBoxService } from 'src/modules/default/black-box/black-box.service';
import { BlackBox } from 'src/entities/black-box/black-box.entity';
import { TrackingBlackBox } from 'src/entities/tracking-black-box/tracking-black-box.entity';
import { TrackingBlackBoxLog } from 'src/entities/tracking-black-box-log/tracking-black-box-log.entity';
import { DinhViHopQuyService } from 'src/modules/default/black-box/dinhvihopquy.service';
import { AnTeckService } from 'src/modules/default/black-box/anteck.service';
import { VietmapService } from 'src/modules/default/black-box/vietmap.service';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { ApiKey } from 'src/entities/api-key/api-key.entity';
import { DefaultReference } from 'src/entities/default-reference/default-reference.entity';
import { Commission } from 'src/entities/commission/commission.entity';
import { SettingRepository } from 'src/repositories/setting.repository';
import { DriverPaymentHistoryRepository } from 'src/repositories/driver-payment-history.repository';
import { Otp } from 'src/entities/otp/otp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      AdminRepository,
      TruckOwnerRepository,
      Company,
      Driver,
      Order,
      Truck,
      Province,
      OrderRepository,
      File,
      Folder,
      DriverRepository,
      SettingRepository,
      TruckRepository,
      Note,
      Notification,
      CompanyRepository,
      NotificationInstance,
      AuditLogRepository,
      OtpLog,
      AdminSetting,
      SpecialRequest,
      PricingRepository,
      TruckTypeFare,
      PayloadFare,
      ZonePrice,
      DistancePrice,
      SurCharges,
      DynamicCharges,
      Distance,
      TruckOwnerBankAccount,
      AdditionalPrice,
      MultipleStopsCharges,
      Tracking,
      TrackingBlackBox,
      TrackingBlackBoxLog,
      BlackBox,
      DefaultPayment,
      ApiKey,
      DefaultReference,
      Commission,
      DriverPaymentHistoryRepository,
      Otp,
    ]),
    HttpModule,
    SmsSendModule,
  ],
  controllers: [AdminUserController],
  providers: [
    PasswordHelper,
    AdminUserService,
    TokenHelper,
    MailHelper,
    OrderService,
    FileHelper,
    TemplatesService,
    LanguageService,
    TruckOwnerService,
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
export class AdminUserModule {}

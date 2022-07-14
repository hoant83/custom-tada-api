import {
  HttpModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailHelper } from './common/helpers/mail.helper';
import { PasswordHelper } from './common/helpers/password.helper';
import { SMSHelper } from './common/helpers/sms.helper';
import { TokenHelper } from './common/helpers/token.helper';
import { AuthenticateMiddleware } from './common/middlewares/authentication.middleware';
import { AssetModule } from './common/modules/asset/asset.module';
import { AuditLogModule } from './common/modules/audit-logs/audit-log.module';
import { LogModule } from './common/modules/custom-logs/log.module';
import { TemplatesService } from './common/modules/email-templates/template.service';
import { LanguageModule } from './common/modules/languagues/language.module';
import { NotificationModule } from './common/modules/notification/notification.module';
import { SmsModule } from './common/modules/sms/sms.module';
import { CommonUserModule } from './common/modules/user/user.module';
import { AdditionalPrice } from './entities/additional-price/additional-price.entity';
import { Address } from './entities/address/address.entity';
import { AdminSetting } from './entities/admin-setting/admin-setting.entity';
import { Admin } from './entities/admin/admin.entity';
import { AuditLog } from './entities/audit-log/audit-log.entity';
import { Company } from './entities/company/company.entity';
import { Customer } from './entities/customer/customer.entity';
import { DefaultReference } from './entities/default-reference/default-reference.entity';
import { DistancePrice } from './entities/distance-price/distance-price.entity';
import { Distance } from './entities/distance/distance.entity';
import { Driver } from './entities/driver/driver.entity';
import { DynamicCharges } from './entities/dynamic-charges/dynamic-charges.entity';
import { File } from './entities/file/file.entity';
import { Folder } from './entities/folder/folder.entity';
import { ImportantNote } from './entities/important-notes/important-notes.entity';
import { Log } from './entities/log/log.entity';
import { MultipleStopsCharges } from './entities/multiple-stops-price/multiple-stops-price.entity';
import { Note } from './entities/note/note.entity';
import { NotificationInstance } from './entities/notification-instance/notification-instance.entity';
import { Notification } from './entities/notification/notification.entity';
import { Order } from './entities/order/order.entity';
import { Otp } from './entities/otp/otp.entity';
import { OtpLog } from './entities/otpLog/otpLog.entity';
import { PayloadFare } from './entities/payload-fare/payload-fare.entity';
import { DefaultPayment } from './entities/payment/payment.entity';
import { Pricing } from './entities/pricing/pricing.entity';
import { Province } from './entities/province/province.entity';
import { Settings } from './entities/setting/setting.entity';
import { SpecialRequest } from './entities/special-request/special-request.entity';
import { SurCharges } from './entities/surcharges/surcharges.entity';
import { Tracking } from './entities/tracking/tracking.entity';
import { TruckTypeFare } from './entities/truck-type-fare/truck-type-fare.entity';
import { Truck } from './entities/truck/truck.entity';
import { TruckOwnerBankAccount } from './entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { TruckOwner } from './entities/truckOwner/truckOwner.entity';
import { ZonePrice } from './entities/zone-price/zone-price.entity';
import { AddressModule } from './modules/default/address/address.module';
import { AdminImportantNoteModule } from './modules/admin/important-notes/important-note.module';
import { AdminNotificationModule } from './modules/admin/notification/notification.module';
import { AdminUserModule } from './modules/admin/user/admin.module';
import { CustomerModule } from './modules/default/customer/customer.module';
import { CustomerRepository } from './repositories/customer.repository';
import { ImportantNoteModule } from './modules/default/important-notes/important-note.module';
import { DriverModule } from './modules/default/driver/driver.module';
import { DriverRepository } from './repositories/driver.repository';
import { HookModule } from './modules/default/hooks/hook.module';
import { OrderModule } from './modules/default/order/order.module';
import { ProvinceModule } from './modules/default/province/province.module';
import { SmsSendModule } from './modules/default/sms/sms.module';
import { TruckOwnerModule } from './modules/default/truckOwner/truckOwner.module';
import { TruckOwnerRepository } from './repositories/truckOwner.repository';
import { BlackBoxModule } from './modules/default/black-box/black-box.module';
import { BlackBox } from './entities/black-box/black-box.entity';
import { TrackingBlackBox } from './entities/tracking-black-box/tracking-black-box.entity';
import { TrackingBlackBoxLog } from './entities/tracking-black-box-log/tracking-black-box-log.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PriceQuotation } from './entities/price-quotation/price-quotation.entity';
import { PriceQuotationModule } from './modules/default/price-quotation/price-quotation.module';
import { SyncSetting } from './entities/sync-setting/sync-setting.entity';
import { SyncModule } from './modules/default/sync/sync.module';
import { PublicModule } from './modules/default/public/public.module';
import { ApiKey } from './entities/api-key/api-key.entity';
import { Commission } from './entities/commission/commission.entity';
import { DriverPaymentHistory } from './entities/driver-payment-history/driver-payment-history.entity';

const env = process.env.NODE_ENV || 'development';

const envFilePath =
  env === 'development' ? '.env' : `.env.${process.env.NODE_ENV}`;

const entities = [
  Log,
  AuditLog,
  File,
  Customer,
  Driver,
  TruckOwner,
  Company,
  Admin,
  Truck,
  Order,
  Province,
  Tracking,
  Folder,
  Notification,
  NotificationInstance,
  Note,
  Otp,
  OtpLog,
  Settings,
  Address,
  DefaultReference,
  DefaultPayment,
  AdminSetting,
  SpecialRequest,
  ZonePrice,
  PayloadFare,
  TruckTypeFare,
  SurCharges,
  DynamicCharges,
  DistancePrice,
  Pricing,
  Distance,
  ImportantNote,
  TruckOwnerBankAccount,
  AdditionalPrice,
  MultipleStopsCharges,
  BlackBox,
  TrackingBlackBox,
  TrackingBlackBoxLog,
  PriceQuotation,
  SyncSetting,
  ApiKey,
  Commission,
  DriverPaymentHistory,
];

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: entities,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      TruckOwnerRepository,
      CustomerRepository,
      DriverRepository,
    ]),
    LanguageModule,
    LogModule,
    PasswordHelper,
    TokenHelper,
    CustomerModule,
    HttpModule,
    AuditLogModule,
    AdminUserModule,
    TruckOwnerModule,
    OrderModule,
    DriverModule,
    ProvinceModule,
    AdminNotificationModule,
    NotificationModule,
    CommonUserModule,
    TypeOrmModule.forFeature([OtpLog]),
    AssetModule,
    SmsModule,
    AddressModule,
    SmsSendModule,
    HookModule,
    AdminImportantNoteModule,
    ImportantNoteModule,
    BlackBoxModule,
    PriceQuotationModule,
    SyncModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailHelper,
    SMSHelper,
    TokenHelper,
    TemplatesService,
    LanguageService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthenticateMiddleware).forRoutes('*');
  }
}

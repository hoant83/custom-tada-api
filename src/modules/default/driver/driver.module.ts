import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileHelper } from 'src/common/helpers/file.helper';
import { MailHelper } from 'src/common/helpers/mail.helper';
import { PasswordHelper } from 'src/common/helpers/password.helper';
import { SMSHelper } from 'src/common/helpers/sms.helper';
import { TokenHelper } from 'src/common/helpers/token.helper';
import { TemplatesService } from 'src/common/modules/email-templates/template.service';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { File } from 'src/entities/file/file.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { Otp } from 'src/entities/otp/otp.entity';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { DriverRepository } from 'src/repositories/driver.repository';
import { OrderRepository } from 'src/repositories/order.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { SmsSendModule } from '../sms/sms.module';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DriverRepository,
      File,
      Tracking,
      OrderRepository,
      Folder,
      Otp,
      TruckOwnerRepository,
      OtpLog,
      AdminSetting,
    ]),
    SmsSendModule,
    HttpModule,
  ],
  controllers: [DriverController],
  providers: [
    DriverService,
    PasswordHelper,
    FileHelper,
    MailHelper,
    TokenHelper,
    TemplatesService,
    SMSHelper,
    LanguageService,
  ],
})
export class DriverModule {}

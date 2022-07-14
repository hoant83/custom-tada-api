import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from 'src/entities/setting/setting.entity';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { Order } from 'src/entities/order/order.entity';
import { SmsSendModule } from 'src/modules/default/sms/sms.module';
import { SMSHelper } from 'src/common/helpers/sms.helper';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { LanguageService } from '../languagues/language.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings, Order, OtpLog]),
    SmsSendModule,
    HttpModule,
  ],
  controllers: [SmsController],
  providers: [SmsService, SMSHelper, LanguageService],
})
export class SmsModule {}

import { HttpModule, HttpService, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageModule } from 'src/common/modules/languagues/language.module';
import { LanguageService } from 'src/common/modules/languagues/language.service';
import { OtpLogRepository } from 'src/repositories/otpLog.repository';
import { CmcService } from './cmc.service';
import { SmsService } from './sms.service';
import { TwillioService } from './twillio.service';

const smsFactory = {
  provide: SmsService,
  useFactory: (
    configService: ConfigService,
    httpService: HttpService,
    otpLog: OtpLogRepository,
    languageService: LanguageService,
  ) => {
    const runMode = configService.get<string>('RUN_MODE');
    if (runMode === 'saas') {
      return new TwillioService(configService, otpLog, languageService);
    }
    return new CmcService(configService, httpService, otpLog, languageService);
  },
  inject: [ConfigService, HttpService, OtpLogRepository, LanguageService],
};

@Module({
  providers: [smsFactory, LanguageService],
  exports: [SmsService],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([OtpLogRepository]),
    LanguageModule,
  ],
})
export class SmsSendModule {}

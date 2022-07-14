import { Injectable } from '@nestjs/common';
import { MailHelper } from './common/helpers/mail.helper';
import { SMSHelper } from './common/helpers/sms.helper';
import { SmsService } from './modules/default/sms/sms.service';

@Injectable()
export class AppService {
  constructor(
    private readonly mailHelper: MailHelper,
    private readonly smsHelper: SMSHelper,
    private readonly smsService: SmsService,
  ) {}
  async getHello(): Promise<string> {
    // this.mailHelper.sendTestEmail();

    // const result = await this.httpService
    //   .get('http://192.168.181.173:4000/api/languages/en')
    //   .toPromise();
    // this.smsHelper.sendTestSMS();

    this.smsService.sendTestSMS();

    return 'Hello World!';
  }
}

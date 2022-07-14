import { customThrowError } from '@anpham1925/nestjs';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SendSms } from '../../admin/user/dto/SendSms.dto';

interface ISmsService {
  sendSMS?: () => void;

  sendTestSMS: () => Promise<void>;

  sendOtp: (otp?: number, phone?: string) => Promise<void>;

  sendOrderNoti: (
    customer?: Record<string, any>,
    orderId?: string,
    type?: string,
    partnerId?: string,
  ) => Promise<void>;

  sendManualSMS: (model: SendSms) => Promise<void>;
}

@Injectable()
export class SmsService implements ISmsService {
  public async sendOtp(..._args): Promise<void> {
    this._throwNotImplemented();
  }

  public async sendTestSMS(): Promise<void> {
    this._throwNotImplemented();
  }

  public async sendOrderNoti(..._args): Promise<void> {
    this._throwNotImplemented();
  }

  public async sendManualSMS(..._args): Promise<void> {
    this._throwNotImplemented();
  }

  private _throwNotImplemented(): void {
    customThrowError('Not implemented!', HttpStatus.NOT_FOUND);
  }
}

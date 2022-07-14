import { Exclude } from 'class-transformer';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { DriverPaymentHistory } from 'src/entities/driver-payment-history/driver-payment-history.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { USER_STATUS } from 'src/entities/enums/userStatus.enum';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { Order } from 'src/entities/order/order.entity';
import { Otp } from 'src/entities/otp/otp.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

export class ExportDriversByAdminDto {
  createdDate: Date;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  verifiedStatus: VERIFIED_STATUS;
  status: USER_STATUS;
  emailVerified: boolean;
  cardNo: string;
  licenseNo: string;
  companyTruckOwnerName: string;
  licenseURL: string;
  cardFrontURL: string;
  cardBackURL: string;
  publicId: string;
  truckOwnerName: string;
  truckOwnerEmail: string;
  phoneActivated: boolean;

  @Exclude()
  updatedDate: Date;

  @Exclude()
  truckOwner: TruckOwner;

  @Exclude()
  password: string;

  @Exclude()
  session: string;

  @Exclude()
  passwordChangedAt: Date;

  @Exclude()
  notiToken: string;

  @Exclude()
  deviceToken: string;

  @Exclude()
  preferLanguage: USER_LANGUAGE;

  @Exclude()
  ownerId: number;

  @Exclude()
  orders: Order[];

  @Exclude()
  orderId: number;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  tracking: Tracking[];

  @Exclude()
  otpCode: Otp;

  @Exclude()
  lastActiveDate: Date;

  @Exclude()
  syncCode: string;

  @Exclude()
  syncDate: Date;

  @Exclude()
  shouldSync: boolean;

  @Exclude()
  paymentHistory: DriverPaymentHistory[];

  constructor(partial: Partial<Driver>) {
    Object.assign(this, partial);
  }
}

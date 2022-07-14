import { Exclude } from 'class-transformer';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { Company } from 'src/entities/company/company.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import {
  CONCATENATED_GOODS_TYPE,
  CONTRACT_CAR_TYPE,
  NON_MOTORIZED_TYPE,
  TRUCK_PAYLOAD,
} from 'src/entities/default-reference/enums/defaultRef.enum';
import { Driver } from 'src/entities/driver/driver.entity';
import { USER_STATUS } from 'src/entities/enums/userStatus.enum';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { CONTAINER_SIZE } from 'src/entities/order/enums/container-size.enum';
import { SERVICE_TYPE } from 'src/entities/order/enums/service-type.enum';
import { Order } from 'src/entities/order/order.entity';
import { Otp } from 'src/entities/otp/otp.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { TRUCK_TYPE } from 'src/entities/truckOwner/enums/truckType.enum';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

export class ExportTruckOwnersByAdminDto {
  id: number;
  createDate: Date;
  email: string;
  firstName: string;
  lastName: string;
  verifiedStatus: VERIFIED_STATUS;
  status: USER_STATUS;
  emailVerified: boolean;
  cardNo: string;
  truckService: TRUCK_TYPE;
  phoneVerified: boolean;
  publicId: string;
  serviceType: SERVICE_TYPE;
  companyName: string;
  referalCode: string;

  @Exclude()
  company: Company;

  @Exclude()
  truckOwnerBankAccount: TruckOwnerBankAccount;

  @Exclude()
  updatedDate: Date;

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
  notShowAgain: boolean;

  @Exclude()
  pickupZone: number;

  @Exclude()
  companyId: number;

  @Exclude()
  drivers: Driver[];

  @Exclude()
  trucks: Truck[];

  @Exclude()
  orders: Order[];

  @Exclude()
  customers: Customer[];

  @Exclude()
  deletedAt: Date;

  @Exclude()
  containerSize: CONTAINER_SIZE[];

  @Exclude()
  truckPayload: (string | TRUCK_PAYLOAD)[];

  @Exclude()
  nonMotorizedType: (string | NON_MOTORIZED_TYPE)[];

  @Exclude()
  concatenatedGoodsType: (string | CONCATENATED_GOODS_TYPE)[];

  @Exclude()
  contractCarType: (string | CONTRACT_CAR_TYPE)[];

  @Exclude()
  lastActiveDate: Date;

  @Exclude()
  tracking: Tracking[];

  @Exclude()
  syncCode: string;

  @Exclude()
  syncDate: Date;

  @Exclude()
  shouldSync: boolean;

  @Exclude()
  otpCode: Otp;

  constructor(partial: Partial<TruckOwner>) {
    Object.assign(this, partial);
  }
}

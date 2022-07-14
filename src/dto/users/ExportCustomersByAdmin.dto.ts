import { Exclude, Expose } from 'class-transformer';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { ApiKey } from 'src/entities/api-key/api-key.entity';
import { Company } from 'src/entities/company/company.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { ACCOUNT_ROLE } from 'src/entities/customer/enums/accountRole.enum';
import { ACCOUNT_TYPE } from 'src/entities/customer/enums/accountType.enum';
import { DefaultReference } from 'src/entities/default-reference/default-reference.entity';
import { USER_STATUS } from 'src/entities/enums/userStatus.enum';
import { VERIFIED_STATUS } from 'src/entities/enums/verifiedStatus.enum';
import { Order } from 'src/entities/order/order.entity';

export class ExportCustomersByAdminDto {
  @Expose()
  createdDate: Date;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  verifiedStatus: VERIFIED_STATUS;
  status: USER_STATUS;
  emailVerified: boolean;
  cardNo: string;
  accountRole: ACCOUNT_ROLE;
  accountType: ACCOUNT_TYPE;

  @Exclude()
  company: Company;

  @Exclude()
  companyId: number;

  @Expose({ name: 'companyName' })
  get companyName() {
    if (this.company === null) {
      return null;
    }

    return this.company.name;
  }

  @Exclude()
  owner: Customer;

  @Expose({ name: 'ownerName' })
  get ownerName(): any {
    if (this.owner === null) {
      return null;
    }

    return this.owner.firstName;
  }

  @Exclude()
  employees: Customer[];

  @Exclude()
  password: string;

  @Exclude()
  updatedDate: Date;

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
  deletedAt: Date;

  @Exclude()
  orders: Order[];

  @Exclude()
  apiKeys: ApiKey[];

  @Exclude()
  defaultRef: DefaultReference;

  @Exclude()
  defaultRefId: number;

  @Exclude()
  payment: DefaultReference;

  @Exclude()
  paymentId: number;

  @Exclude()
  lastActiveDate: Date;

  @Exclude()
  limitOrder: number;

  @Exclude()
  limitWarning: boolean;

  constructor(partial: Partial<Customer>) {
    Object.assign(this, partial);
  }
}

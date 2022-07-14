import {
  Entity,
  Column,
  ManyToOne,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserCommonEntity } from '../userCommon.entity';
import { Company } from '../company/company.entity';
import { ACCOUNT_ROLE } from './enums/accountRole.enum';
import { TruckOwner } from '../truckOwner/truckOwner.entity';
import { Order } from '../order/order.entity';
import { ACCOUNT_TYPE } from './enums/accountType.enum';
import { Address } from '../address/address.entity';
import { DefaultReference } from '../default-reference/default-reference.entity';
import { DefaultPayment } from '../payment/payment.entity';
import { ApiKey } from '../api-key/api-key.entity';

@Entity()
export class Customer extends UserCommonEntity {
  @Column({
    nullable: true,
    length: 60,
  })
  cardNo: string;

  @Column({
    type: 'enum',
    enum: ACCOUNT_ROLE,
    default: ACCOUNT_ROLE.OWNER,
    nullable: true,
  })
  accountRole: ACCOUNT_ROLE;

  @Column({
    type: 'enum',
    enum: ACCOUNT_TYPE,
    default: ACCOUNT_TYPE.INDIVIDUAL,
    nullable: true,
  })
  accountType: ACCOUNT_TYPE;

  @ManyToOne(
    () => Company,
    company => company.customers,
  )
  company: Company;

  @Column({ nullable: true })
  companyId: number;

  @ManyToOne(
    () => Customer,
    customer => customer.employees,
  )
  owner: Customer;

  @OneToMany(
    () => Customer,
    customer => customer.owner,
  )
  employees: Customer[];

  @Column({ nullable: true })
  ownerId: number;

  @ManyToMany(
    () => TruckOwner,
    TruckOwner => TruckOwner.customers,
  )
  @JoinTable()
  favoriteTruckOwners: TruckOwner[];

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(
    () => Order,
    order => order.createdByCustomer,
  )
  orders: Order[];

  @OneToMany(
    () => Address,
    address => address.owner,
  )
  addresses: Address[];

  @OneToMany(
    () => ApiKey,
    apiKey => apiKey.customer,
  )
  apiKeys: ApiKey[];

  @OneToOne(
    () => DefaultReference,
    defaultReference => defaultReference.customer,
  )
  defaultRef: DefaultReference;

  @Column({ nullable: true })
  defaultRefId: number;

  @OneToOne(
    () => DefaultPayment,
    defaultPayment => defaultPayment.customer,
  )
  payment: DefaultReference;

  @Column({ nullable: true })
  paymentId: number;

  @Column({ nullable: true })
  lastActiveDate: Date;

  @Column({ type: 'float8', default: 99999 })
  limitOrder: number;

  @Column({ default: false })
  limitWarning: boolean;

  @Column({ nullable: true })
  verifyMailSentDate: Date;
}

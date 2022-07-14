import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  ManyToMany,
} from 'typeorm';
import { TRUCK_TYPE } from './enums/truckType.enum';
import { UserCommonEntity } from '../userCommon.entity';
import { Company } from '../company/company.entity';
import { Driver } from '../driver/driver.entity';
import { Truck } from '../truck/truck.entity';
import { Order } from '../order/order.entity';
import { Customer } from '../customer/customer.entity';
import { SERVICE_TYPE } from '../order/enums/service-type.enum';
import { CONTAINER_SIZE } from '../order/enums/container-size.enum';
import {
  NON_MOTORIZED_TYPE,
  CONCATENATED_GOODS_TYPE,
  CONTRACT_CAR_TYPE,
  TRUCK_PAYLOAD,
} from '../default-reference/enums/defaultRef.enum';
import { TruckOwnerBankAccount } from '../truckowner-bankaccount/truckowner-bankaccount.entity';
import { Tracking } from '../tracking/tracking.entity';
import { Otp } from '../otp/otp.entity';

@Entity()
export class TruckOwner extends UserCommonEntity {
  @Column({
    nullable: true,
    length: 60,
  })
  cardNo: string;

  @Column({
    type: 'enum',
    enum: TRUCK_TYPE,
    nullable: true,
  })
  truckService: TRUCK_TYPE;

  @Column('text', {
    nullable: true,
    array: true,
  })
  pickupZone: number[];

  @OneToOne(
    () => Company,
    company => company.truckOwner,
  )
  @JoinColumn()
  company: Company;

  @Column({ nullable: true })
  companyId: number;

  @Column({ nullable: true })
  companyName: string;

  @OneToMany(
    () => Driver,
    driver => driver.truckOwner,
  )
  drivers: Driver[];

  @OneToMany(
    () => Truck,
    truck => truck.truckOwner,
  )
  trucks: Truck[];

  @OneToMany(
    () => Order,
    order => order.owner,
  )
  orders: Order[];

  @ManyToMany(
    () => Customer,
    Customer => Customer.favoriteTruckOwners,
  )
  customers: Customer[];

  @Column({
    nullable: true,
    unique: true,
  })
  publicId: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true })
  serviceType: SERVICE_TYPE;

  @Column('text', {
    nullable: true,
    array: true,
  })
  containerSize: CONTAINER_SIZE[];

  @Column('text', {
    nullable: true,
    array: true,
  })
  truckPayload: (string | TRUCK_PAYLOAD)[];

  @Column('text', {
    nullable: true,
    array: true,
  })
  nonMotorizedType: (string | NON_MOTORIZED_TYPE)[];

  @Column('text', {
    nullable: true,
    array: true,
  })
  concatenatedGoodsType: (string | CONCATENATED_GOODS_TYPE)[];

  @Column('text', {
    nullable: true,
    array: true,
  })
  contractCarType: (string | CONTRACT_CAR_TYPE)[];

  @OneToOne(
    () => TruckOwnerBankAccount,
    truckOwnerBankAccount => truckOwnerBankAccount.truckOwner,
    { onDelete: 'CASCADE' },
  )
  truckOwnerBankAccount: TruckOwnerBankAccount;

  @Column({ nullable: true })
  lastActiveDate: Date;

  @OneToMany(
    () => Tracking,
    tracking => tracking.truckowner,
  )
  tracking: Tracking[];

  @Column({ nullable: true })
  referalCode: string;

  @Column({ unique: true, nullable: true })
  syncCode: string;

  @Column({ nullable: true })
  syncDate: Date;

  @Column({ default: false })
  shouldSync: boolean;

  @Column({
    default: false,
  })
  phoneVerified: boolean;

  @OneToOne(
    () => Otp,
    otp => otp.truckOwner,
  )
  otpCode: Otp;
}

import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { Order } from 'src/entities/order/order.entity';
import { Tracking } from '../tracking/tracking.entity';
import { Otp } from '../otp/otp.entity';
import { IsEmail } from 'class-validator';
import { VERIFIED_STATUS } from '../enums/verifiedStatus.enum';
import { USER_STATUS } from '../enums/userStatus.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { DriverPaymentHistory } from '../driver-payment-history/driver-payment-history.entity';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @Column({
    unique: true,
    nullable: true,
  })
  @IsEmail()
  email: string;

  @Column({
    nullable: true,
    length: 12,
    unique: true,
  })
  phoneNumber: string;

  @Column({
    nullable: true,
    length: 60,
  })
  password: string;

  @Column({
    nullable: true,
    length: 60,
  })
  session: string;

  @Column({
    default: new Date(),
  })
  passwordChangedAt: Date;

  @Column({
    nullable: true,
  })
  firstName: string;

  @Column({
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: VERIFIED_STATUS,
    default: VERIFIED_STATUS.UNVERIFIED,
  })
  verifiedStatus: VERIFIED_STATUS;

  @Column({
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.INACTIVE,
  })
  status: USER_STATUS;

  @Column({
    nullable: true,
  })
  notiToken: string;

  @Column({
    nullable: true,
  })
  deviceToken: string;

  @Column({
    default: false,
  })
  emailVerified: boolean;

  @Column({
    enum: USER_LANGUAGE,
    default: USER_LANGUAGE.VI,
  })
  preferLanguage: USER_LANGUAGE;

  @Column({
    nullable: true,
    length: 60,
  })
  cardNo: string;

  @Column({
    nullable: true,
    length: 60,
  })
  licenseNo: string;

  @Column({
    nullable: true,
    length: 60,
  })
  companyTruckOwnerName: string;

  @ManyToOne(
    () => TruckOwner,
    truckOwner => truckOwner.drivers,
  )
  truckOwner: TruckOwner;

  @Column({ nullable: true })
  ownerId: number;

  @ManyToMany(
    () => Order,
    order => order.drivers,
  )
  orders: Order[];

  @Column({ nullable: true })
  orderId: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @JoinColumn()
  licenseURL: string;

  @JoinColumn()
  cardFrontURL: string;

  @JoinColumn()
  cardBackURL: string;

  @JoinColumn()
  publicId: string;

  @JoinColumn()
  truckOwnerName: string;

  @JoinColumn()
  truckOwnerEmail: string;

  @OneToMany(
    () => Tracking,
    tracking => tracking.driver,
  )
  tracking: Tracking[];

  @Column({
    default: false,
  })
  phoneActivated: boolean;

  @OneToOne(
    () => Otp,
    otp => otp.user,
  )
  otpCode: Otp;

  @Column({ nullable: true })
  lastActiveDate: Date;

  @Column({ unique: true, nullable: true })
  syncCode: string;

  @Column({ nullable: true })
  syncDate: Date;

  @Column({ default: false })
  shouldSync: boolean;

  @OneToMany(
    () => DriverPaymentHistory,
    history => history.driver,
  )
  paymentHistory: DriverPaymentHistory[];
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AdditionalPrice } from '../additional-price/additional-price.entity';
import { Admin } from '../admin/admin.entity';
import { BaseEntity } from '../base.entity';
import { Company } from '../company/company.entity';
import { Customer } from '../customer/customer.entity';
import {
  NON_MOTORIZED_PAYLOAD,
  NON_MOTORIZED_TYPE,
  TRUCK_PAYLOAD,
  TRUCK_TYPE_DEFAULT,
  CONCATENATED_GOODS_TYPE,
  CONCATENATED_GOODS_PAYLOAD,
  CONTRACT_CAR_TYPE,
  CONTRACT_CAR_PAYLOAD,
} from '../default-reference/enums/defaultRef.enum';
import { Driver } from '../driver/driver.entity';
import { Folder } from '../folder/folder.entity';
import { Note } from '../note/note.entity';
import { PAYMENT_TYPE } from '../payment/enums/payment.enum';
import { Tracking } from '../tracking/tracking.entity';
import { Truck } from '../truck/truck.entity';
import { TruckOwner } from '../truckOwner/truckOwner.entity';
import { CANCELED_BY } from './enums/canceled-by.enum';
import { CARGO_TYPE } from './enums/cargo-type.enum';
import { CONTAINER_SIZE } from './enums/container-size.enum';
import { CONTAINER_TYPE } from './enums/container-type.enum';
import { ORDER_STATUS } from './enums/order-status.enum';
import { ORDER_TYPE } from './enums/order-type.enum';
import { SERVICE_TYPE } from './enums/service-type.enum';
import { TRUCK_SPECIAL_TYPE } from './enums/truck-special-type.enum';

@Entity()
export class Order extends BaseEntity {
  @ManyToOne(
    () => Customer,
    customer => customer.orders,
  )
  createdByCustomer: Customer;

  @Column({ nullable: true })
  createdByCustomerId: number;

  @ManyToOne(() => Admin)
  createdByAdmin: Admin;

  @Column({ nullable: true })
  createdByAdminId: number;

  @ManyToOne(() => Company)
  company: Company;

  @Column({ nullable: true })
  companyId: number;

  @Column({ nullable: true, unique: true })
  orderId: string;

  @Column({ nullable: true })
  referenceNo: string;

  @Column({ nullable: true })
  referenceNote: string;

  @Column({ default: ORDER_TYPE.STANDARD })
  orderType: ORDER_TYPE;

  @Column({ default: ORDER_STATUS.CREATED })
  status: ORDER_STATUS;

  @Column({ nullable: true })
  canceledBy: CANCELED_BY;

  @Column({ default: SERVICE_TYPE.NORMAL_TRUCK_VAN })
  serviceType: SERVICE_TYPE;

  @Column({ nullable: true })
  containerSize?: CONTAINER_SIZE;

  @Column({ nullable: true })
  containerType?: CONTAINER_TYPE;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  containerQuantity?: number;

  @Column({ nullable: true })
  truckSpecialType: TRUCK_SPECIAL_TYPE;

  @Column({ nullable: true, default: PAYMENT_TYPE.INSTANT_CASH })
  paymentType: PAYMENT_TYPE;

  @Column({ nullable: true })
  otherPaymentType: string;

  @Column({ nullable: true })
  truckQuantity: number;

  @Column({ nullable: true })
  truckLoad: string;

  @Column({ nullable: true })
  truckType: TRUCK_TYPE_DEFAULT;

  @Column({ nullable: true })
  nonMotorizedType: NON_MOTORIZED_TYPE;

  @Column({ nullable: true })
  nonMotorizedQuantity: NON_MOTORIZED_TYPE;

  @Column({ nullable: true })
  nonMotorizedPayload: NON_MOTORIZED_PAYLOAD;

  @Column({ nullable: true })
  truckPayload: TRUCK_PAYLOAD;

  @Column({ nullable: true })
  concatenatedGoodsType: CONCATENATED_GOODS_TYPE;

  @Column({ nullable: true })
  concatenatedGoodsPayload: CONCATENATED_GOODS_PAYLOAD;

  @Column({ nullable: true })
  concatenatedGoodsQuantity: number;

  @Column({ nullable: true })
  contractCarType: CONTRACT_CAR_TYPE;

  @Column({ nullable: true })
  contractCarPayload: CONTRACT_CAR_PAYLOAD;

  @Column({ nullable: true })
  contractCarQuantity: number;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  bussinessLicenseNO: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  cargoType?: CARGO_TYPE;

  @ApiPropertyOptional()
  @Column({ nullable: true })
  cargoName?: string;

  @Column({ type: 'decimal', nullable: true })
  cargoWeight: number;

  @Column({ nullable: true })
  packageSize: string;

  @Column({ nullable: true })
  packageSizeText: string;

  @Column('text', { array: true, nullable: true })
  pickupAddress: number[];

  @Column({ nullable: true })
  pickupAddressText: string;

  @Column({ nullable: true })
  pickupContactNo: string;

  @Column({ nullable: true })
  pickupCity: number;

  @Column({ nullable: true })
  pickupTime: Date;

  //-- Old data will be mirage
  @Column('text', { array: true, nullable: true })
  dropoffAddress: number[];

  @Column({ nullable: true })
  dropoffAddressText: string;

  @Column({ nullable: true })
  dropoffContactNo: string;

  @Column({ nullable: true })
  dropoffTime: Date;

  @Column({ nullable: true })
  pickupEmptyContainer: boolean;

  @Column({ nullable: true })
  pickupEmptyAddress: string;

  @Column({ nullable: true })
  dropoffEmptyContainer: boolean;

  @Column({ nullable: true })
  dropoffEmptyAddress: string;
  // -- End Old data

  @Column('text', { nullable: true, array: true })
  dropOffFields: string[];

  @Column('text', { nullable: true })
  noteToDriver: string;

  @Column({ nullable: true })
  price: boolean;

  @Column({ type: 'float8', nullable: true })
  priceRequest: number;

  @Column({ default: false })
  useSuggestedPrice: boolean;

  @Column({ type: 'float8', nullable: true })
  suggestedPrice: number;

  @Column({ default: false })
  useQuotePrice: boolean;

  @Column({ nullable: true })
  inChargeName: string;

  @Column({ nullable: true })
  inChargeContactNo: string;

  @Column({ nullable: true })
  otherGeneralNotes: string;

  @Column({ nullable: true })
  detailRequest: string;

  @Column({ nullable: true })
  staffNote: string;

  @Column({ nullable: true })
  staffAnotherNote: string;

  @Column({ nullable: true })
  pickupCode: string;

  @Column({ nullable: true })
  deliveryCode: string;

  @ManyToOne(
    () => TruckOwner,
    truckOwner => truckOwner.orders,
  )
  owner: TruckOwner;

  @Column({ nullable: true })
  ownerId: number;

  @Column({ nullable: true })
  customerOwnerId: number;

  @ManyToMany(
    () => Truck,
    truck => truck.orders,
  )
  @JoinTable()
  trucks: Truck[];

  @ManyToMany(
    () => Driver,
    driver => driver.orders,
  )
  @JoinTable()
  drivers: Driver[];

  @OneToMany(
    () => Tracking,
    tracking => tracking.order,
  )
  tracking: Tracking[];

  @OneToMany(
    () => AdditionalPrice,
    additionalPrices => additionalPrices.order,
  )
  additionalPrices: AdditionalPrice[];

  @OneToMany(
    () => Folder,
    folder => folder.order,
    { onDelete: 'CASCADE' },
  )
  folders: Folder[];

  @OneToMany(
    () => Note,
    note => note.order,
  )
  notes: Note[];

  @Column({ nullable: true })
  vat: boolean;

  @Column({ nullable: true })
  vatInfo: string;

  @Column({ nullable: true })
  beforeCancel: string;

  @Column({ nullable: true, default: false })
  verifiedPickup: boolean;

  @Column('text', { array: true, default: () => 'array[]::integer[]' })
  verifiedDelivery: number[];

  @Column({ nullable: false, default: false })
  skippedVerifiedDelivery: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true, default: 10 })
  remainAcceptedSms: number;

  @Column({ nullable: true, default: 10 })
  remainCancelledSms: number;

  @Column({ default: false })
  driverPickupSms: boolean;

  @Column({ default: false })
  driverDeliverySms: boolean;

  @Column({ default: false })
  orderCompleteSms: boolean;

  @Column('text', {
    nullable: true,
    array: true,
    default: () => 'array[]::integer[]',
  })
  specialRequests: number[];

  @Column({ nullable: true })
  deliveredTime: Date;

  @Column({ nullable: true })
  paymentDueDate: Date;

  @Column({ default: false })
  isPaymentDoneByCustomer: boolean;

  @Column({ default: false })
  isPaymentDoneByTruckOwner: boolean;

  @Column({ type: 'float8', nullable: true })
  totalPrice: number;

  @Column({ type: 'float8', nullable: true })
  distance: number;

  @Column({ nullable: true })
  assignToFav: number;

  @Column({ nullable: true })
  sort: number;

  @Column({ default: false })
  isSetCommission: boolean;

  @Column({ default: false })
  allowSeeCommission: boolean;

  @Column({ default: false })
  allowSeePrice: boolean;

  @Column({ type: 'float8', nullable: true })
  percentCommission: number;

  @Column({ type: 'float8', nullable: true })
  fixedCommission: number;
}

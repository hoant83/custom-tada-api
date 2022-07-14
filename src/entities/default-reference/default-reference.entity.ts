import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { CONTAINER_SIZE } from '../order/enums/container-size.enum';
import { CONTAINER_TYPE } from '../order/enums/container-type.enum';
import { SERVICE_TYPE } from '../order/enums/service-type.enum';
import {
  NON_MOTORIZED_TYPE,
  CONCATENATED_GOODS_PAYLOAD,
  CONCATENATED_GOODS_TYPE,
  CONTRACT_CAR_PAYLOAD,
  CONTRACT_CAR_TYPE,
  TRUCK_PAYLOAD,
  TRUCK_TYPE_DEFAULT,
} from './enums/defaultRef.enum';

@Entity()
export class DefaultReference extends BaseEntity {
  @Column({
    default: SERVICE_TYPE.NORMAL_TRUCK_VAN,
    type: 'enum',
    enum: SERVICE_TYPE,
    nullable: true,
  })
  typeOfTransport: SERVICE_TYPE;

  @Column({ nullable: true, type: 'enum', enum: CONTAINER_TYPE })
  containerType: CONTAINER_TYPE;

  @Column({ nullable: true, type: 'enum', enum: TRUCK_TYPE_DEFAULT })
  truckType: TRUCK_TYPE_DEFAULT;

  @Column({ nullable: true })
  nonMotorizedType: NON_MOTORIZED_TYPE;

  @Column({ nullable: true, type: 'enum', enum: CONCATENATED_GOODS_TYPE })
  concatenatedGoodsType: CONCATENATED_GOODS_TYPE;

  @Column({ nullable: true, type: 'enum', enum: CONTRACT_CAR_TYPE })
  contractCarType: CONTRACT_CAR_TYPE;

  @Column({ nullable: true, type: 'enum', enum: CONTAINER_SIZE })
  containerSize: CONTAINER_SIZE;

  @Column({ nullable: true, type: 'enum', enum: TRUCK_PAYLOAD })
  truckPayload: TRUCK_PAYLOAD;

  @Column({ nullable: true, type: 'enum', enum: CONCATENATED_GOODS_PAYLOAD })
  concatenatedGoodsPayload: CONCATENATED_GOODS_PAYLOAD;

  @Column({ nullable: true, type: 'enum', enum: CONTRACT_CAR_PAYLOAD })
  contractCarPayload: CONTRACT_CAR_PAYLOAD;

  @Column({ nullable: true })
  orderManagerName: string;

  @Column({ nullable: true })
  orderManagerNo: string;

  @Column({ nullable: true })
  pickupCity: number;

  @Column('text', { array: true, nullable: true })
  dropoffAddress: number[];

  @Column({ nullable: true })
  dropoffAddressText: string;

  @Column('text', { array: true, nullable: true })
  pickupAddress: number[];

  @Column({ nullable: true })
  pickupAddressText: string;

  @Column({ nullable: true })
  personInChargePickup: string;

  @Column({ nullable: true })
  personInChargePickupNO: string;

  @Column({ nullable: true })
  personInChargeDropoff: string;

  @Column({ nullable: true })
  personInChargeDropoffNO: string;

  @OneToOne(
    () => Customer,
    customer => customer.defaultRef,
  )
  customer: Customer;

  @Column({ nullable: true })
  customerId: number;
}

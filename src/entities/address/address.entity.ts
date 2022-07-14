import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { LOCATION_TYPE } from './enums/localtionType.enum';

@Entity()
export class Address extends BaseEntity {
  @Column({ nullable: false })
  company: string;

  @Column({ nullable: false, enum: LOCATION_TYPE })
  locationType: LOCATION_TYPE;

  @Column({ nullable: false })
  locationName: string;

  @Column('text', { array: true, nullable: true })
  pickupAddress: number[];

  @Column({ nullable: true })
  pickupAddressText: string;

  @Column({ nullable: false })
  locationAddress: string;

  @Column({ nullable: true })
  pickupCity: number;

  @Column('text', { array: true, nullable: true })
  dropoffAddress: number[];

  @Column({ nullable: true })
  dropoffAddressText: string;

  @Column({ nullable: true })
  inChargeName: string;

  @Column({ nullable: true })
  inChargeNo: string;

  @ManyToOne(
    () => Customer,
    customer => customer.addresses,
  )
  owner: Customer;

  @Column()
  ownerId: number;
}

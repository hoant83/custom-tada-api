import { Entity, Column, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { Driver } from '../driver/driver.entity';
import { NotificationInstance } from '../notification-instance/notification-instance.entity';
import { TruckOwner } from '../truckOwner/truckOwner.entity';
import { SOURCE } from './enums/source.enum';

@Entity()
export class Notification extends BaseEntity {
  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ nullable: true })
  titleEN: string;

  @Column({ nullable: true })
  bodyEN: string;

  @Column({ nullable: true })
  titleKR: string;

  @Column({ nullable: true })
  bodyKR: string;

  @Column({ nullable: true })
  titleID: string;

  @Column({ nullable: true })
  bodyID: string;

  @Column({
    default: SOURCE.SYSTEM,
    enum: SOURCE,
  })
  source: SOURCE;

  @OneToMany(
    () => NotificationInstance,
    instance => instance.notification,
  )
  instances: NotificationInstance[];

  @Column({ nullable: true, default: false })
  sendToCustomer: boolean;

  @Column({ nullable: true, default: false })
  sendToTruck: boolean;

  @Column({ nullable: true, default: false })
  sendToDriver: boolean;

  @Column({ nullable: true })
  createdByEmail: string;

  @JoinColumn()
  sendToCustomerList: Customer[];

  @JoinColumn()
  sendToTruckownerList: TruckOwner[];

  @JoinColumn()
  sendToDriverList: Driver[];
}

import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Driver } from '../driver/driver.entity';
import { Order } from '../order/order.entity';
import { TruckOwner } from '../truckOwner/truckOwner.entity';

@Entity()
export class Tracking extends BaseEntity {
  @ManyToOne(
    () => Order,
    order => order.tracking,
  )
  order: Order;

  @Column()
  orderId: number;

  @ManyToOne(
    () => Driver,
    driver => driver.tracking,
  )
  driver: Driver;

  @Column({ nullable: true })
  driverId: number;

  @ManyToOne(
    () => TruckOwner,
    truckowner => truckowner.tracking,
  )
  truckowner: TruckOwner;

  @Column({ nullable: true })
  truckownerId: number;

  @Column({
    type: 'float8',
  })
  lat: number;

  @Column({
    type: 'float8',
  })
  lng: number;
}

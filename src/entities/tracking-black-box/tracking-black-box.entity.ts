import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Order } from '../order/order.entity';
import { TrackingBlackBoxLog } from '../tracking-black-box-log/tracking-black-box-log.entity';

@Entity()
export class TrackingBlackBox extends BaseEntity {
  @ManyToOne(
    () => Order,
    order => order.tracking,
  )
  order: Order;

  @Column()
  orderId: number;

  @Column()
  truckId: number;

  @Column()
  type: string;

  @Column({
    type: 'json',
  })
  trackingInfo: Record<string, any>;

  @OneToMany(
    () => TrackingBlackBoxLog,
    trackingBlackBoxLog => trackingBlackBoxLog.trackingBlackBox,
  )
  trackingBlackBoxLogs: TrackingBlackBoxLog[];
}

import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TrackingBlackBox } from '../tracking-black-box/tracking-black-box.entity';

@Entity()
export class TrackingBlackBoxLog extends BaseEntity {
  @ManyToOne(
    () => TrackingBlackBox,
    trackingBlackBox => trackingBlackBox.trackingBlackBoxLogs,
  )
  trackingBlackBox: TrackingBlackBox;

  @Column({ nullable: true })
  trackingBlackBoxId: number;

  @Column()
  trackingDate: Date;

  @Column({
    type: 'json',
  })
  trackingInfo: Record<string, any>;
}

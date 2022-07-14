import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Pricing } from '../pricing/pricing.entity';

@Entity()
export class ZonePrice extends BaseEntity {
  @Column({ type: 'float8', nullable: true })
  sameZone: number;

  @Column({ nullable: true })
  pickupZoneArea: string;

  @Column({ nullable: true })
  dropoffZoneArea: string;

  @Column('text', {
    array: true,
    nullable: true,
    default: () => 'array[]::integer[]',
  })
  payload: number[];

  @Column({ type: 'float8', nullable: true })
  cost: number;

  @ManyToOne(
    () => Pricing,
    pricing => pricing.zonePrices,
  )
  pricing: Pricing;
}

import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Pricing } from '../pricing/pricing.entity';

@Entity()
export class TruckTypeFare extends BaseEntity {
  @Column('text', {
    array: true,
    nullable: true,
    default: () => 'array[]::integer[]',
  })
  truckType: number[];

  @Column({ type: 'float8', nullable: true })
  price: number;

  @ManyToOne(
    () => Pricing,
    pricing => pricing.payloadFares,
  )
  pricing: Pricing;
}

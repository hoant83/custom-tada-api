import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PRICE_OPTIONS } from '../pricing/enums/priceOption.enum';
import { Pricing } from '../pricing/pricing.entity';

@Entity()
export class PayloadFare extends BaseEntity {
  @Column('text', {
    array: true,
    nullable: true,
    default: () => 'array[]::integer[]',
  })
  payload: number[];

  @Column({ type: 'float8', nullable: true, default: 0 })
  price: number;

  @Column({
    nullable: true,
    type: 'enum',
    enum: PRICE_OPTIONS,
    default: PRICE_OPTIONS.PERCENTAGE,
  })
  priceOption: PRICE_OPTIONS;

  @ManyToOne(
    () => Pricing,
    pricing => pricing.payloadFares,
  )
  pricing: Pricing;
}

import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PRICE_OPTIONS } from '../pricing/enums/priceOption.enum';
import { Pricing } from '../pricing/pricing.entity';

@Entity()
export class MultipleStopsCharges extends BaseEntity {
  @Column({
    type: 'enum',
    enum: PRICE_OPTIONS,
    nullable: true,
    default: PRICE_OPTIONS.PERCENTAGE,
  })
  multipleStopPriceOption: PRICE_OPTIONS;

  @Column('text', {
    array: true,
    nullable: true,
    default: () => 'array[]::integer[]',
  })
  truckType: number[];

  @Column('text', {
    array: true,
    nullable: true,
    default: () => 'array[]::integer[]',
  })
  truckPayload: number[];

  @Column({ type: 'float8', nullable: true })
  multipleStopPrice: number;

  @ManyToOne(
    () => Pricing,
    pricing => pricing.multipleStopsCharges,
  )
  pricing: Pricing;
}

import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TRUCK_PAYLOAD } from '../default-reference/enums/defaultRef.enum';
import { PRICE_OPTIONS } from '../pricing/enums/priceOption.enum';
import { Pricing } from '../pricing/pricing.entity';

@Entity()
export class SurCharges extends BaseEntity {
  @Column({
    type: 'enum',
    enum: PRICE_OPTIONS,
    nullable: true,
    default: PRICE_OPTIONS.PERCENTAGE,
  })
  specialGoodsPriceOption: PRICE_OPTIONS;

  @Column({ type: 'float8', nullable: true })
  specialGoodsPrice: number;

  @Column({
    type: 'enum',
    enum: PRICE_OPTIONS,
    nullable: true,
    default: PRICE_OPTIONS.PERCENTAGE,
  })
  heavyCargoPriceOption: PRICE_OPTIONS;

  @Column({
    type: 'enum',
    enum: TRUCK_PAYLOAD,
    nullable: true,
  })
  payloadMoreThan: TRUCK_PAYLOAD;

  @Column({ type: 'float8', nullable: true })
  heavyCargoPrice: number;

  @Column({
    type: 'enum',
    enum: PRICE_OPTIONS,
    nullable: true,
    default: PRICE_OPTIONS.PERCENTAGE,
  })
  inconvenientLocationPriceOption: PRICE_OPTIONS;

  @Column({ type: 'float8', nullable: true })
  inconvenientLocationPrice: number;

  @ManyToOne(
    () => Pricing,
    pricing => pricing.surCharges,
  )
  pricing: Pricing;
}

import { Column, Entity, ManyToOne, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PRICE_OPTIONS } from '../pricing/enums/priceOption.enum';
import { Pricing } from '../pricing/pricing.entity';

@Entity()
export class DynamicCharges extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: PRICE_OPTIONS,
    nullable: true,
    default: PRICE_OPTIONS.PERCENTAGE,
  })
  priceOption: PRICE_OPTIONS;

  @Column({ type: 'float8', nullable: true })
  cost: number;

  @ManyToOne(
    () => Pricing,
    pricing => pricing.dynamicCharges,
  )
  pricing: Pricing;

  @DeleteDateColumn()
  deletedAt?: Date;
}

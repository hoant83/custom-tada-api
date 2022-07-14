import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Order } from '../order/order.entity';
import { ADDITIONAL_PROICE_OPTIONS } from './enums/additional-price-options.enum';

@Entity()
@Unique(['orderId', 'type'])
export class AdditionalPrice extends BaseEntity {
  @Column({ type: 'float8', nullable: true, default: 0 })
  price: number;

  @Column({
    default: ADDITIONAL_PROICE_OPTIONS.ADJUSTMENT_AMOUNT,
    enum: ADDITIONAL_PROICE_OPTIONS,
  })
  type: ADDITIONAL_PROICE_OPTIONS;

  @ManyToOne(
    () => Order,
    order => order.additionalPrices,
  )
  order: Order;

  @Column()
  orderId: number;
}

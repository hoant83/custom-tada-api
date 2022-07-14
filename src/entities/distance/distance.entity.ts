import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { DistancePrice } from '../distance-price/distance-price.entity';

@Entity()
export class Distance extends BaseEntity {
  @Column({ nullable: true })
  from: number;

  @Column({ nullable: true })
  to: number;

  @Column({ type: 'float8', nullable: true })
  costPerKm: number;

  @ManyToOne(
    () => DistancePrice,
    distancePrice => distancePrice.distances,
  )
  distancePrice: DistancePrice;

  @Column({ nullable: true })
  distancePriceId: number;
}

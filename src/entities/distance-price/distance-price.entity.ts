import { Entity, Column, ManyToOne, OneToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Distance } from '../distance/distance.entity';
import { Pricing } from '../pricing/pricing.entity';

@Entity()
export class DistancePrice extends BaseEntity {
  @Column('text', {
    array: true,
    nullable: true,
    default: () => 'array[]::integer[]',
  })
  payload: number[];

  @Column('text', {
    array: true,
    nullable: true,
    default: () => 'array[]::integer[]',
  })
  truckType: number[];

  @OneToMany(
    () => Distance,
    distance => distance.distancePrice,
  )
  @JoinTable()
  distances: Distance[];

  @ManyToOne(
    () => Pricing,
    pricing => pricing.distancePrices,
  )
  pricing: Pricing;
}

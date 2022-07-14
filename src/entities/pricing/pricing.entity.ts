import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { DistancePrice } from '../distance-price/distance-price.entity';
import { DynamicCharges } from '../dynamic-charges/dynamic-charges.entity';
import { MultipleStopsCharges } from '../multiple-stops-price/multiple-stops-price.entity';
import { PayloadFare } from '../payload-fare/payload-fare.entity';
import { SurCharges } from '../surcharges/surcharges.entity';
import { TruckTypeFare } from '../truck-type-fare/truck-type-fare.entity';
import { ZonePrice } from '../zone-price/zone-price.entity';

@Entity()
export class Pricing extends BaseEntity {
  @Column({ type: 'float8', nullable: true, default: 0 })
  baseFareTractor: number;

  @Column({ type: 'float8', nullable: true, default: 0 })
  baseFareNormal: number;

  @Column({ type: 'float8', nullable: true, default: 0 })
  baseFareNonMotorized: number;

  @Column({ type: 'float8', nullable: true, default: 0 })
  baseFareConcatenatedGoods: number;

  @Column({ type: 'float8', nullable: true, default: 0 })
  baseFareContractCar: number;

  @OneToMany(
    () => PayloadFare,
    payloadFare => payloadFare.pricing,
    { cascade: true },
  )
  payloadFares: PayloadFare[];

  @OneToMany(
    () => ZonePrice,
    zonePrice => zonePrice.pricing,
    { cascade: true },
  )
  zonePrices: ZonePrice[];

  @OneToMany(
    () => DistancePrice,
    distancePrice => distancePrice.pricing,
    { cascade: true },
  )
  distancePrices: DistancePrice[];

  @OneToMany(
    () => MultipleStopsCharges,
    multipleStopsCharges => multipleStopsCharges.pricing,
    { cascade: true },
  )
  multipleStopsCharges: MultipleStopsCharges[];

  @OneToMany(
    () => SurCharges,
    surCharges => surCharges.pricing,
    { cascade: true },
  )
  surCharges: SurCharges[];

  @OneToMany(
    () => DynamicCharges,
    dynamicCharges => dynamicCharges.pricing,
    { cascade: true },
  )
  dynamicCharges: DynamicCharges[];

  @OneToMany(
    () => TruckTypeFare,
    truckTypeFare => truckTypeFare.pricing,
    { cascade: true },
  )
  truckTypeFares: TruckTypeFare[];

  @Column({ nullable: false, default: false })
  isUsing: boolean;
}

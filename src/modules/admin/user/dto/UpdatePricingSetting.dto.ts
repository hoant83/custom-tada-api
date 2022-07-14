import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { DistancePrice } from 'src/entities/distance-price/distance-price.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { MultipleStopsCharges } from 'src/entities/multiple-stops-price/multiple-stops-price.entity';
import { PayloadFare } from 'src/entities/payload-fare/payload-fare.entity';
import { SurCharges } from 'src/entities/surcharges/surcharges.entity';
import { TruckTypeFare } from 'src/entities/truck-type-fare/truck-type-fare.entity';
import { ZonePrice } from 'src/entities/zone-price/zone-price.entity';

export class UpdatePricingSetting {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  baseFareTractor: number;

  @IsOptional()
  @ApiPropertyOptional()
  baseFareNormal: number;

  @IsOptional()
  @ApiPropertyOptional()
  baseFareNonMotorized: number;

  @IsOptional()
  @ApiPropertyOptional()
  baseFareConcatenatedGoods: number;

  @IsOptional()
  @ApiPropertyOptional()
  baseFareContractCar: number;

  @IsOptional()
  @ApiPropertyOptional()
  isUsing: boolean;

  @IsOptional()
  @ApiPropertyOptional()
  payloadFares: PayloadFare[];

  @IsOptional()
  @ApiPropertyOptional()
  zonePrices: ZonePrice[];

  @IsOptional()
  @ApiPropertyOptional()
  distancePrices: DistancePrice[];

  @IsOptional()
  @ApiPropertyOptional()
  surCharges: SurCharges[];

  @IsOptional()
  @ApiPropertyOptional()
  dynamicCharges: DynamicCharges[];

  @IsOptional()
  @ApiPropertyOptional()
  truckTypeFares: TruckTypeFare[];

  @IsOptional()
  @ApiPropertyOptional()
  multipleStopsCharges: MultipleStopsCharges[];
}

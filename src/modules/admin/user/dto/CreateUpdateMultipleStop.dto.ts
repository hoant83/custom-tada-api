import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PRICE_OPTIONS } from 'src/entities/pricing/enums/priceOption.enum';

export class CreateUpdateMultipleStop {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  truckType: number[];

  @IsOptional()
  @ApiPropertyOptional()
  truckPayload: number[];

  @IsOptional()
  @ApiPropertyOptional()
  price: number;

  @IsOptional()
  @ApiPropertyOptional()
  priceOption: PRICE_OPTIONS;
}

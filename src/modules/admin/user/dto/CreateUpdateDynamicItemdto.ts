import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PRICE_OPTIONS } from 'src/entities/pricing/enums/priceOption.enum';

export class CreateUpdateDynamicItem {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  name: string;

  @IsOptional()
  @ApiPropertyOptional()
  priceOption: PRICE_OPTIONS;

  @IsOptional()
  @ApiPropertyOptional()
  cost: number;
}

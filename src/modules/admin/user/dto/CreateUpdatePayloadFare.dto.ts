import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateUpdatePayloadFare {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  payload: number[];

  @IsOptional()
  @ApiPropertyOptional()
  price: number;

  @IsOptional()
  @ApiPropertyOptional()
  priceOption: number;
}

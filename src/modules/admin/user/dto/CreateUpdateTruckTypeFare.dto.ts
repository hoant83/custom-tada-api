import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateUpdateTruckTypeFare {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  truckType: number[];

  @IsOptional()
  @ApiPropertyOptional()
  price: number;
}

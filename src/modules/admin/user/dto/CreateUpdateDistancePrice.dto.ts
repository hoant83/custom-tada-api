import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Distance } from 'src/entities/distance/distance.entity';

export class CreateUpdateDistancePrice {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  payload: number[];

  @IsOptional()
  @ApiPropertyOptional()
  distances: Distance[];
}

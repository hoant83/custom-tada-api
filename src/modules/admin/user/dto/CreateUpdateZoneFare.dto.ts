import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateUpdateZoneFare {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  payload: number[];

  @IsOptional()
  @ApiPropertyOptional()
  pickupZoneArea: string;

  @IsOptional()
  @ApiPropertyOptional()
  dropoffZoneArea: string;

  @IsOptional()
  @ApiPropertyOptional()
  sameZone: number;

  @IsOptional()
  @ApiPropertyOptional()
  cost: number;
}

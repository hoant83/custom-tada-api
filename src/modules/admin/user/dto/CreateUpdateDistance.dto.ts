import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateUpdateDistance {
  @IsOptional()
  @ApiPropertyOptional()
  id: number;

  @IsOptional()
  @ApiPropertyOptional()
  from: number;

  @IsOptional()
  @ApiPropertyOptional()
  to: number;

  @IsOptional()
  @ApiPropertyOptional()
  costPerKm: number;
}

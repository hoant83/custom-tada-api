import { IsPositive, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationRequest {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number;

  @ApiProperty()
  @Type(() => Number)
  @IsPositive()
  @IsInt()
  take: number;

  @ApiPropertyOptional()
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({
    enum: SortDirection,
  })
  @IsOptional()
  orderDirection?: SortDirection;
}

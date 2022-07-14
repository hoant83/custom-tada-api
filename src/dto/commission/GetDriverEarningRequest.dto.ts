import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetDriverEarningRequestDto {
  @ApiProperty()
  take: number;

  @ApiProperty()
  skip: number;

  @IsOptional()
  @ApiPropertyOptional()
  from?: string; // format: MM-YYYY

  @IsOptional()
  @ApiPropertyOptional()
  to?: string; // fotmat: MM-YYYY

  @IsOptional()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @ApiPropertyOptional()
  searchBy?: string;

  @IsOptional()
  @ApiPropertyOptional()
  searchKeyword?: string;

  @IsOptional()
  @ApiPropertyOptional()
  isExport?: string;
}

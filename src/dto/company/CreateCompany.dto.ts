import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @IsNotEmpty()
  @ApiProperty()
  name?: string;

  @IsOptional()
  @ApiPropertyOptional()
  phone?: string;

  @IsOptional()
  @ApiPropertyOptional()
  address?: string;

  @IsOptional()
  @ApiPropertyOptional()
  licenseNo?: string;
}

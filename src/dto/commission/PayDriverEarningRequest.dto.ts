import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class PayDriverEarningRequestDto {
  @IsOptional()
  @ApiPropertyOptional()
  note?: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  date: Date;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isCash?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isTransfer?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  isOthers?: boolean;

  @IsOptional()
  @ApiPropertyOptional()
  othersNote?: string;
}

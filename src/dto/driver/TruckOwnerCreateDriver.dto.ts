import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TruckOwnerCreateDriver {
  @IsOptional()
  @ApiPropertyOptional()
  phoneNumber?: string;

  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty()
  cardNo: string;

  @IsNotEmpty()
  @ApiProperty()
  ownerId: number;
}

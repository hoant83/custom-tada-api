import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class LocationDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  lat: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  lng: number;
}

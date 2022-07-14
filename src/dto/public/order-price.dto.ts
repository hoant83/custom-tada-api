import { ApiProperty } from '@nestjs/swagger';
import { PriceDto } from './price.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderPriceDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => PriceDto)
  data: PriceDto;
}

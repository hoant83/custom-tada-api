import { ApiProperty } from '@nestjs/swagger';
import { OrderRequestDto } from '../order/order-request.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty()
  apiKey: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => OrderRequestDto)
  data: OrderRequestDto;
}

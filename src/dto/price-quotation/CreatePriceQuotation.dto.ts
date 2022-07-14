import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePriceQuotation {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  toAllCustomers: boolean;

  @ApiProperty()
  quotation: any;

  @ApiProperty()
  note: string;

  @ApiProperty()
  toCustomers: number[];

  @ApiProperty()
  currency: string;
}

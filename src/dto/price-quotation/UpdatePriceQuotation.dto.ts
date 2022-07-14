import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePriceQuotation {
  @IsNotEmpty()
  @ApiProperty()
  id: number;

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

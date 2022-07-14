import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { Transform } from 'class-transformer';

export class DriverRequestDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ownerId: number;

  @ApiProperty()
  @Transform(value => (value ? value : null))
  updateDate: Date;

  @ApiProperty()
  @Transform(value => (value ? value : null))
  createDate: Date;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  cardNo: string;

  @IsEnum(ORDER_STATUS)
  @ApiProperty()
  status: ORDER_STATUS;
}

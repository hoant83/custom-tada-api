import { ApiProperty } from '@nestjs/swagger';

export class PaymentDoneDto {
  @ApiProperty()
  isDone: boolean;
}

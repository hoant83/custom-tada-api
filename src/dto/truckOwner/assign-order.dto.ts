import { ApiProperty } from '@nestjs/swagger';

export class AssignOrderDto {
  @ApiProperty({ type: [Number] })
  truckIds: number[];

  @ApiProperty({ type: [Number] })
  driverIds: number[];
}

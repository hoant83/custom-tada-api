import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';
import { IsNumberString, IsString } from 'class-validator';

export class FilterRequestDto extends PaginationRequest {
  @ApiPropertyOptional()
  @IsNumberString()
  orderId?: number;

  @ApiPropertyOptional()
  @IsNumberString()
  truckId?: number;

  @ApiPropertyOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional()
  @IsString()
  toDate?: string;
}

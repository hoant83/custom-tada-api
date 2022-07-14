import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';
import { DriverRequestDto } from './driver-request.dto';

export class FilterRequestDto extends PaginationRequest {
  @ApiPropertyOptional()
  driver?: DriverRequestDto;

  @ApiPropertyOptional()
  truck?: DriverRequestDto;

  @ApiPropertyOptional()
  searchBy?: string;

  @ApiPropertyOptional()
  searchKeyword?: string;
}

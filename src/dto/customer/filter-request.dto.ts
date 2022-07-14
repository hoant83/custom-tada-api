import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';
import { CustomerRequestDto } from './customer-request.dto';

export class CustomerFilterRequestDto extends PaginationRequest {
  @ApiPropertyOptional()
  order?: CustomerRequestDto;

  @ApiPropertyOptional()
  searchBy?: string;

  @ApiPropertyOptional()
  searchKeyword?: string;
}

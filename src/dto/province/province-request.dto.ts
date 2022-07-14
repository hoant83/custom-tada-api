import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';

export class ProvinceRequestDto extends PaginationRequest {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  nameWithType?: string;

  @ApiPropertyOptional({ required: false })
  searchBy?: string;

  @ApiPropertyOptional({ required: false })
  searchKeyword?: string;
}

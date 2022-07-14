import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';

export class FilterLogRequestDto extends PaginationRequest {
  @IsOptional()
  @ApiPropertyOptional()
  userId?: number;

  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @ApiPropertyOptional()
  action?: string;

  @IsOptional()
  @ApiPropertyOptional()
  key?: string;

  @IsOptional()
  @ApiPropertyOptional()
  module?: string;

  @IsOptional()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @ApiPropertyOptional({
    enum: [
      TOKEN_ROLE.ADMIN,
      TOKEN_ROLE.CUSTOMER,
      TOKEN_ROLE.DRIVER,
      TOKEN_ROLE.TRUCK_OWNER,
    ],
  })
  role?: TOKEN_ROLE;

  @IsOptional()
  @ApiPropertyOptional()
  @Transform(x => new Date(x))
  after?: Date;

  @IsOptional()
  @ApiPropertyOptional()
  @Transform(x => new Date(x))
  before?: Date;
}

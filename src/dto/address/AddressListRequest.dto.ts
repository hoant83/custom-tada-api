import { PaginationRequest } from '@anpham1925/nestjs';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Address } from 'src/entities/address/address.entity';
import { LOCATION_TYPE } from 'src/entities/address/enums/localtionType.enum';

export class AddressListRequest extends PaginationRequest<Address> {
  @ApiPropertyOptional()
  locationType?: LOCATION_TYPE;
}

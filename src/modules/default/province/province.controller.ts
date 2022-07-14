import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { ProvinceRequestDto } from 'src/dto/province/province-request.dto';
import { ProvinceService } from './province.service';

@Controller('province')
@UseInterceptors(ClassSerializerInterceptor)
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post('import')
  async import(): Promise<any> {
    return await this.provinceService.import();
  }

  @Get()
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getList(@Query() provinceRequestDto: ProvinceRequestDto): Promise<any> {
    return await this.provinceService.getList(provinceRequestDto);
  }
}

import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  UseInterceptors,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BlackBoxService } from './black-box.service';
import { CommonAuthenticationGuard } from 'src/common/guards/commonAuthentication.guard';
import { DinhViHopQuyTracking } from 'src/dto/black-box/DinhViHopQuyTracking.dto';
import { customThrowError } from 'src/common/helpers/throw.helper';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';
import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';

interface Result {
  count: number;
  data: DinhViHopQuyTracking[];
}

@ApiTags('Black Box')
@Controller('black-box')
@UseGuards(CommonAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class BlackBoxController {
  constructor(private readonly blackBoxService: BlackBoxService) {}
  @ApiBearerAuth()
  @Get('tracking-truck')
  async trackingTruckByOrder(
    @Query('orderId') orderId: number,
    @Req() request: Request,
  ): Promise<any> {
    try {
      return await this.blackBoxService.trackingTruckByOrder(orderId, request);
    } catch (e) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        e,
      );
    }
  }

  @ApiBearerAuth()
  @Get('tracking-history')
  async trackingHistory(
    // @Query() filterRequestDto: FilterRequestDto,
    @Query('devName') devName: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Req() request: Request,
  ): Promise<Result> {
    try {
      return await this.blackBoxService.trackingTruckHistory(
        devName,
        fromDate,
        toDate,
        request,
      );
    } catch (e) {
      customThrowError(
        RESPONSE_MESSAGES.ERROR,
        HttpStatus.BAD_REQUEST,
        RESPONSE_MESSAGES_CODE.ERROR,
        e,
      );
    }
  }
}

import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { PaginationRequest } from 'src/common/dtos/pagination.dto';
import { NotificationResponse } from './dto/notificationResponse.dto';
import { RegisterToken } from './dto/register-token.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Common - Noti')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notiService: NotificationService) {}

  @Post('register-token')
  register(@Body() body: RegisterToken, @Req() request: Request): Promise<any> {
    return this.notiService.registerToken(
      body.token,
      (request as any).user,
      body.platform,
    );
  }

  @Get()
  @ApiOkResponse({
    description: RESPONSE_EXPLAINATION.LIST_SPECIAL,
  })
  list(
    @Query() filter: PaginationRequest,
    @Req() request: Request,
  ): Promise<[NotificationResponse[], number, number]> {
    return this.notiService.listInstance((request as any).user, filter);
  }

  @Put('read/:id')
  readNotification(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.notiService.readNoti(id, (request as any).user);
  }

  @Put('stop-warning')
  stopWarning(@Req() request: Request): Promise<boolean> {
    return this.notiService.stopWarning((request as any).user.id);
  }
}

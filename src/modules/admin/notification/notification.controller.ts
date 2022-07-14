import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  NOTIFICATION_ACTION,
  NOTIFICATION_MODULE,
} from 'src/common/constants/actions/notification/notification.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { AdminAuthenticationGuard } from 'src/common/guards/adminAuthentication.guard';
import { GetRequest } from '../user/dto/GetRequest.dto';
import { SendSms } from '../user/dto/SendSms.dto';
import { CreateEditNotificationDto } from './dto/CreateEditNotification.dto';
import { NotificationDetailtResponse } from './dto/NotificationDetailResponse.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
@UseGuards(AdminAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Admin - Noti')
@SetMetadata(METADATA.MODULE, NOTIFICATION_MODULE)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notiService: NotificationService) {}

  @Get('test/:token')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  getList(@Param('token') token: string): Promise<any> {
    return this.notiService.sendTestNoti(token);
  }

  @Post()
  @SetMetadata(METADATA.ACTION, NOTIFICATION_ACTION.CREATE_NOTIFICATION)
  createNotification(
    @Body() model: CreateEditNotificationDto,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.notiService.createNotification(model, (request as any).user);
  }

  @Get('all')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getNotifications(
    @Query() model: GetRequest,
  ): Promise<[NotificationDetailtResponse[], number]> {
    return this.notiService.getNotifications(model);
  }

  // @Get('')
  // getNotificationByUsers(
  //   @Query() model: GetRequest,
  //   @Req() request: Request,
  // ): Promise<NotificationDetailtResponse> {
  //   return this.notiService.getNotificationByUser(model, (request as any).user);
  // }

  @Get(':id')
  getNotification(
    @Param('id') id: number,
  ): Promise<NotificationDetailtResponse> {
    return this.notiService.getNotification(id);
  }

  @SetMetadata(METADATA.ACTION, NOTIFICATION_ACTION.SEND_SMS_MANUAL)
  @Post('send/sms')
  sendManualSMS(@Body() model: SendSms): Promise<boolean> {
    return this.notiService.sendManualSMS(model);
  }
}

import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  UseGuards,
  Body,
  SetMetadata,
  Req,
  Put,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { PublicAuthenticationGuard } from 'src/common/guards/publicAuthentication.guard';
import { CreateOrderDto } from 'src/dto/public/create-order.dto';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { PERMISSION } from 'src/entities/api-key/enums/permission.enum';
import { Request } from 'express';
import { Order } from 'src/entities/order/order.entity';
import { OrderService } from '../order/order.service';
import { APIKeyDto } from 'src/dto/public/api-key.dto';
import { OrderPriceDto } from 'src/dto/public/order-price.dto';

@ApiTags('Public')
@Controller('public')
@UseGuards(PublicAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly orderService: OrderService,
  ) {}
  // @ApiBearerAuth()
  @Post('orders')
  @SetMetadata(METADATA.PUBLIC_API_ACTION, PERMISSION.CREATE_ORDER)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<Order> {
    return await this.publicService.createOrder(
      createOrderDto.data,
      (req as any).user,
      req,
    );
  }

  @Put('orders/:id')
  @SetMetadata(METADATA.PUBLIC_API_ACTION, PERMISSION.UPDATE_ORDER)
  async updateOrder(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() orderRequestModel: CreateOrderDto,
    @Req() req: Request,
  ): Promise<any> {
    return await this.publicService.updateOrder(
      orderId,
      orderRequestModel.data,
      (req as any).user,
      req,
    );
  }

  @Delete('orders/:id')
  @SetMetadata(METADATA.PUBLIC_API_ACTION, PERMISSION.DELETE_ORDER)
  async deleteOrder(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() data: APIKeyDto,
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.delete(orderId, request);
  }

  @Post('orders/pricing')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async getActivePricing(
    @Body() orderRequestDto: OrderPriceDto,
  ): Promise<number> {
    return await this.publicService.getActivePricing(orderRequestDto.data);
  }
}

import { PaginationRequest, PaginationResult } from '@anpham1925/nestjs';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  SetMetadata,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PRICE_QUOTATION_MODULE } from 'src/common/constants/actions/price-quotation/price-quotation.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { CommonAuthenticationGuard } from 'src/common/guards/commonAuthentication.guard';
import { PriceQuotation } from 'src/entities/price-quotation/price-quotation.entity';
import { PriceQuotationService } from './price-quotation.service';
import { CreatePriceQuotation } from 'src/dto/price-quotation/CreatePriceQuotation.dto';
import { UpdatePriceQuotation } from 'src/dto/price-quotation/UpdatePriceQuotation.dto';

@ApiTags('Price Quotation')
@ApiBearerAuth()
@Controller('price-quotations')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(CommonAuthenticationGuard)
@SetMetadata(METADATA.MODULE, PRICE_QUOTATION_MODULE)
export class PriceQuotationController {
  constructor(private readonly priceQuotationService: PriceQuotationService) {}

  @Get('')
  async getPriceQuotations(
    @Query() filterRequestDto: PaginationRequest<PriceQuotation>,
  ): Promise<PaginationResult<PriceQuotation>> {
    return await this.priceQuotationService.getPriceQuotations(
      filterRequestDto,
    );
  }

  @Get('customer-options')
  async getCustomerOptions(@Query('search') search?: string): Promise<any> {
    return await this.priceQuotationService.getCustomerOptions(search);
  }

  @Get('customer/:customerId')
  async getPriceQuotationsForCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query() filterRequestDto: PaginationRequest<PriceQuotation>,
  ): Promise<PaginationResult<PriceQuotation>> {
    return await this.priceQuotationService.getPriceQuotationsForCustomer(
      customerId,
      filterRequestDto,
    );
  }

  @Get(':id')
  async getPriceQuotationById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<PriceQuotation> {
    return await this.priceQuotationService.getPriceQuotationById(id);
  }

  @Post('')
  async createPriceQuotation(
    @Body() model: CreatePriceQuotation,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.priceQuotationService.createPriceQuotation(
      model,
      (request as any).user.id,
    );
  }

  @Put('')
  async updatePriceQuotation(
    @Body() model: UpdatePriceQuotation,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.priceQuotationService.updatePriceQuotation(
      model,
      (request as any).user.id,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.priceQuotationService.delete(id, request);
  }

  @Patch(':id/published')
  async published(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.priceQuotationService.published(id);
  }

  @Patch(':id/un-published')
  async unPublished(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.priceQuotationService.unPublished(id);
  }
}

import { PaginationRequest, PaginationResult } from '@anpham1925/nestjs';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ADDRESS_MODULE } from 'src/common/constants/actions/address/address.action';
import { CUSTOMER_ACTION } from 'src/common/constants/actions/customer/customer.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { CommonAuthenticationGuard } from 'src/common/guards/commonAuthentication.guard';
import { CreateAddress } from 'src/dto/address/CreateAddress.dto';
import { UpdateAddress } from 'src/dto/address/UpdateAddress.dto';
import { Address } from 'src/entities/address/address.entity';
import { AddressService } from './address.service';
@ApiTags('Address')
@ApiBearerAuth()
@Controller('addresses')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(CommonAuthenticationGuard)
@SetMetadata(METADATA.MODULE, ADDRESS_MODULE)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.CREATE_ADDRESS)
  async createAddress(
    @Body() model: CreateAddress,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.addressService.createAddress(
      model,
      (request as any).user.id,
    );
  }

  @Get('')
  async getAddresses(
    @Query() filterRequestDto: PaginationRequest<Address>,
    @Req() request: Request,
  ): Promise<PaginationResult<Address>> {
    return await this.addressService.getAddresses(
      filterRequestDto,
      (request as any).user.id,
    );
  }

  @Get(':id')
  async getAddressById(
    @Param('id', ParseIntPipe) addressId: number,
    @Req() request: Request,
  ): Promise<Address> {
    return await this.addressService.getAddressById(
      addressId,
      (request as any).user.id,
    );
  }

  @Put('')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPDATE_ADDRESS)
  async update(
    @Body() model: UpdateAddress,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.addressService.updateAddress(
      model,
      (request as any).user.id,
    );
  }

  @Delete(':id')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.DELETE_ADDRESS)
  async delete(
    @Param('id', ParseIntPipe) addressId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.addressService.delete(
      addressId,
      (request as any).user.id,
      request,
    );
  }
}

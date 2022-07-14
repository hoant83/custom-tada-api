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
  Req,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { DRIVER_ACTION } from 'src/common/constants/actions/driver/driver.action';
import {
  ORDER_ACTION,
  ORDER_MODULE,
} from 'src/common/constants/actions/order/order.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { LocationDto } from 'src/common/dtos/location.dto';
import { OrderAuthenticationGuard } from 'src/common/guards/orderAuthentication.guard';
import {
  multerOptions,
  multerOptionsCsv,
} from 'src/common/helpers/utility.helper';
import { Csv, UploadFile } from 'src/dto/file/UploadFile.dto';
import { FoldersResponseDto } from 'src/dto/folders/FoldersResponse.dto';
import { AdditionalPriceRequest } from 'src/dto/order/additional-price-request.dto';
import { DeleteAdditionalPrice } from 'src/dto/order/delete-additional-price.dto';
import { distanceRequest } from 'src/dto/order/distance-request.dto';
import { noteRequestDto } from 'src/dto/order/note-request.dto';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { UpdateCommissionRequestDto } from 'src/dto/order/update-commission-request.dto';
import { GeneralSettupCommissionDto } from 'src/dto/setting/general-setting-commission.dto';
import { BankAccountDetailResponse } from 'src/dto/truckOwner/bankAccount/BankAccountDetailResponse.dto';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { Folder } from 'src/entities/folder/folder.entity';
import { ORDER_STATUS } from 'src/entities/order/enums/order-status.enum';
import { Order } from 'src/entities/order/order.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('order')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(OrderAuthenticationGuard)
@SetMetadata(METADATA.MODULE, ORDER_MODULE)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('stupid-update')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async stupidUpdate(): Promise<boolean> {
    return await this.orderService.stupidUpdate();
  }

  @Get('general-setting-commission')
  async getGeneralSettingCommisson(
    @Req() request: Request,
  ): Promise<GeneralSettupCommissionDto> {
    return await this.orderService.getGeneralSettingCommission(
      (request as any).user.id,
    );
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OrderResponseDto> {
    return await this.orderService.getById(id);
  }

  @Get(':id/truck-owner')
  async getTruckOwnerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TruckOwner> {
    return await this.orderService.getTruckOwnerByOrderId(id);
  }

  @Put(':id')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.UPDATE_ORDER)
  async update(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() orderRequestModel: OrderRequestDto,
    @Req() request: Request,
  ): Promise<Order> {
    return await this.orderService.update(
      orderId,
      orderRequestModel,
      (request as any).user,
      request,
    );
  }

  @Put(':id/status/:status')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.UPDATE_STATUS_ORDER)
  async updateStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('status') status: ORDER_STATUS,
    @Req() request: Request,
  ): Promise<Order> {
    return await this.orderService.updateStatus(
      orderId,
      status,
      (request as any).user,
      request,
    );
  }

  @Put(':id/update-commission')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.UPDATE_COMMISSION)
  async updateCommission(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() body: UpdateCommissionRequestDto,
  ): Promise<boolean> {
    return await this.orderService.updateCommission(
      orderId,
      body.isEnableSetCommissionForDriver,
      body.isEnableAllowDriverSeeCommission,
      body.isEnableAllowDriverSeeOrdersPrice,
      body.percentCommission,
      body.fixedCommission,
    );
  }

  @Delete(':id')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.DELETE_ONE_ORDER)
  async delete(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.delete(orderId, request);
  }

  @Post(':id/truck/:truckId')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.ADD_TRUCK_TO_ORDER)
  async createOrderTruck(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('truckId', ParseIntPipe) truckId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.addTrucksToOrder(orderId, truckId, request);
  }

  @Post(':id/truck')
  async createBulkOrderTruck(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() truckIds: number[] | string[],
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.addTrucksToOrder(orderId, truckIds, request);
  }

  @Post(':id/driver/:driverId')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.ADD_DRIVER_TO_ORDER)
  async createOrderDriver(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.addDriversToOrder(
      orderId,
      driverId,
      request,
    );
  }

  @Post(':id/driver')
  async createBulkOrderDriver(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() driverIds: number[] | string[],
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.addDriversToOrder(
      orderId,
      driverIds,
      request,
    );
  }

  @Get(':orderId/clone')
  async cloneOrder(
    @Param('orderId') orderId: string,
    @Req() req: Request,
  ): Promise<Order> {
    return await this.orderService.clone(
      orderId,
      (req as any).user.id,
      (req as any).user.role,
    );
  }

  @Get(':id/truck')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getTrucksByOrder(
    @Param('id', ParseIntPipe) orderId: number,
  ): Promise<any> {
    return await this.orderService.getTrucksByOrder(orderId);
  }

  @Get(':id/driver')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getDriversByOrder(
    @Param('id', ParseIntPipe) orderId: number,
  ): Promise<any> {
    return await this.orderService.getDriversByOrder(orderId);
  }

  @Delete(':id/driver/:driverId')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.REMOVE_DRIVER_FROM_ORDER)
  async removeOrderDriver(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.removeDriversFromOrder(
      orderId,
      driverId,
      request,
    );
  }

  @Delete(':id/driver')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.REMOVE_DRIVER_FROM_ORDER)
  async removeBulkOrderDriver(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() driverIds: number[] | string[],
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.removeDriversFromOrder(
      orderId,
      driverIds,
      request,
    );
  }

  @Delete(':id/truck/:truckId')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.REMOVE_TRUCK_FROM_ORDER)
  async removeOrderTruck(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('truckId', ParseIntPipe) truckId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.removeTrucksFromOrder(
      orderId,
      truckId,
      request,
    );
  }

  @Delete(':id/truck')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.REMOVE_TRUCK_FROM_ORDER)
  async removeBulkOrderTruck(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() truckIds: number[] | string[],
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.removeTrucksFromOrder(
      orderId,
      truckIds,
      request,
    );
  }

  @Put(':id/find-new-truck')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.FIND_NEW_TRUCK)
  async findNewTruck(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.findNewTruck(
      orderId,
      (request as any).user,
      request,
    );
  }

  @Post('distance')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async calculateDistanceData(@Body() model: distanceRequest): Promise<Folder> {
    return await this.orderService.calculateDistanceData(model);
  }

  @Post(':orderId/tracking')
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.SEND_TRACKING)
  async createTracking(
    @Req() request: Request,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() model: LocationDto,
  ): Promise<boolean> {
    return this.orderService.createTracking(
      orderId,
      (request as any).user,
      model,
      request,
    );
  }

  @Get('folder/:order/:folder')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getDocuments(
    @Param('order', ParseIntPipe) orderId: number,
    @Param('folder', ParseIntPipe) folderId: number,
  ): Promise<FoldersResponseDto> {
    return await this.orderService.getFolderDocuments(orderId, folderId);
  }

  @Get('folder/:order')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getListFolders(
    @Param('order', ParseIntPipe) orderId: number,
  ): Promise<Folder[]> {
    return await this.orderService.getListFolders(orderId);
  }

  @Delete('folders/:order')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.DELETE_FOLDER_FROM_ORDER)
  async deleteFolders(
    @Param('order', ParseIntPipe) orderId: number,
    @Body() foldersIds: number[],
    @Req() request: Request,
  ): Promise<Folder[]> {
    return await this.orderService.deleteFolders(orderId, foldersIds, request);
  }

  @Delete('folder/:order/:folder')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.DELETE_FOLDER_FROM_ORDER)
  async deleteFolder(
    @Param('order', ParseIntPipe) orderId: number,
    @Param('folder', ParseIntPipe) folderId: number,
    @Req() request: Request,
  ): Promise<Folder[]> {
    return await this.orderService.deleteFolder(orderId, folderId, request);
  }

  @Delete('file/:file')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.DELETE_FILE_FROM_ORDER)
  async deleteFile(
    @Param('file') fileId: string,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.deleteFile(
      fileId,
      REFERENCE_TYPE.ORDER_DOCUMENT,
      request,
    );
  }

  @Post(':order/note/')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.ADD_NOTE_TO_ORDER)
  async addNote(
    @Body() model: noteRequestDto,
    @Param('order', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.addNote(model, orderId, request);
  }

  @Post(':id/upload-document')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.UPLOAD_DOCUMENT_TO_ORDER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Order documents upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async uploadDocumentWhenCreated(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.uploadDocumentWhenCreated(
      file,
      orderId,
      REFERENCE_TYPE.ORDER_DOCUMENT,
      request,
    );
  }

  @Post('document/:id/:folder')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.UPLOAD_DOCUMENT_TO_ORDER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Order documents upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) orderId: number,
    @Param('folder', ParseIntPipe) folderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.uploadDocument(
      file,
      orderId,
      folderId,
      REFERENCE_TYPE.ORDER_DOCUMENT,
      request,
    );
  }

  @Post('import')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.IMPORT_ORDER)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Import order',
    type: Csv,
  })
  @UseInterceptors(FileInterceptor('csv', multerOptionsCsv))
  async importData(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.importData(file, request);
  }

  @Delete(':order/note/:note')
  @SetMetadata(METADATA.ACTION, ORDER_ACTION.DELETE_NOTE_FROM_ORDER)
  async deleteNote(
    @Param('note', ParseIntPipe) noteId: number,
    @Param('order', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.orderService.deleteNote(orderId, noteId, request);
  }

  @Get(':order/pickup/:pickup')
  async verifyPickupCode(
    @Param('order', ParseIntPipe) orderId: number,
    @Param('pickup') pickupCode: string,
  ): Promise<boolean> {
    return await this.orderService.verifyPickupCode(orderId, pickupCode);
  }

  @Get(':order/delivery/:delivery/:step')
  async verifyDeliveryCode(
    @Param('order', ParseIntPipe) orderId: number,
    @Param('delivery') deliveryCode: string,
    @Param('step', ParseIntPipe) stepNumber: number,
  ): Promise<boolean> {
    return await this.orderService.verifyDeliveryCode(
      orderId,
      deliveryCode,
      stepNumber,
    );
  }

  @Post('pricing')
  async getActivePricing(
    @Body() orderRequestDto: OrderRequestDto,
  ): Promise<number> {
    return await this.orderService.getActivePricing(orderRequestDto);
  }

  @Get('pricing/dynamic-charges')
  async getDynamicCharges(): Promise<DynamicCharges[] | null> {
    return await this.orderService.getDynamicCharges();
  }

  @Get('pricing/deleted-dynamic-charges')
  async getDynamicChargesWithDeleted(): Promise<DynamicCharges[] | null> {
    return await this.orderService.getDynamicChargesWithDeleted();
  }

  @Get('truck-bank-info/:truckId')
  async getBankInfo(
    @Param('truckId', ParseIntPipe) truckId: number,
  ): Promise<BankAccountDetailResponse> {
    return await this.orderService.getBankInfo(truckId);
  }

  @Post('additional-price/:id')
  async updateAdditionalPrice(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() model: AdditionalPriceRequest,
  ): Promise<boolean> {
    return await this.orderService.updateAdditionalPrice(orderId, model);
  }

  @Put('additional-price/delete/:id')
  async deleteAdditionalPrice(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() model: DeleteAdditionalPrice,
  ): Promise<boolean> {
    return await this.orderService.deleteAdditionalPrice(orderId, model);
  }
}

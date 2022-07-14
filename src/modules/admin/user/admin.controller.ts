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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  ADMIN_ACTION,
  ADMIN_MODULE,
} from 'src/common/constants/actions/admin/admin.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { TYPE_EXPORT_ORDER } from 'src/common/constants/type-export.enum';
import { TYPE_REPORT } from 'src/common/constants/type-report.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { AdminAuthenticationGuard } from 'src/common/guards/adminAuthentication.guard';
import {
  multerOptions,
  multerOptionsLogo,
} from 'src/common/helpers/utility.helper';
import { AuditLogService } from 'src/common/modules/audit-logs/audit-log.service';
import { CreateAdminDto } from 'src/dto/admin/CreateAdmin.dto';
import { GetDriverEarningRequestDto } from 'src/dto/commission/GetDriverEarningRequest.dto';
import { PayDriverEarningRequestDto } from 'src/dto/commission/PayDriverEarningRequest.dto';
import { CompanyDetailResponse } from 'src/dto/company/CompanyDetail.dto';
import { AdminCreateDriver } from 'src/dto/driver/AdminCreateDriver.dto';
import { DriverDetailResponse } from 'src/dto/driver/DriverDetail.dto';
import { TruckOwnerCreateDriver } from 'src/dto/driver/TruckOwnerCreateDriver.dto';
import { UploadFile, UploadFiles } from 'src/dto/file/UploadFile.dto';
import {
  FilterRequestDto,
  FilterRequestDtoV2,
  FilterStatisticRequestDto,
} from 'src/dto/order/filter-request.dto';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { PaymentDoneDto } from 'src/dto/order/payment-done.dto';
import { TrucksDetailResponse } from 'src/dto/truck/TrucksDetail.dto';
import { CreateUpdateBankAccount } from 'src/dto/truckOwner/bankAccount/CreateUpdateBankAccount.dto';
import { CreateTruckDto } from 'src/dto/truckOwner/CreateTruck.dto';
import { TruckOwnerResponseDto } from 'src/dto/truckOwner/TruckOwnerResponse.dto';
import { ChangePassword } from 'src/dto/users/ChangePassword.dto';
import { CheckToken } from 'src/dto/users/CheckToken.dto';
import { CreateUserByAdminDto } from 'src/dto/users/CreateUserByAdmin.dto';
import { ExportCustomersByAdminDto } from 'src/dto/users/ExportCustomersByAdmin.dto';
import { ExportOrdersByCustomerDto } from 'src/dto/users/ExportOrdersByCustomer.dto';
import { LoginResponseDto } from 'src/dto/users/LoginResponse.dto';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
//import { Commission } from 'src/entities/commission/commission.entity';
import { Distance } from 'src/entities/distance/distance.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { Order } from 'src/entities/order/order.entity';
import { Pricing } from 'src/entities/pricing/pricing.entity';
import { Settings } from 'src/entities/setting/setting.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { OrderService } from 'src/modules/default/order/order.service';
import { AdminUserService } from './admin.service';
import { CreateUpdateDistancePrice } from './dto/CreateUpdateDistancePrice.dto';
import { CreateUpdateDynamicItem } from './dto/CreateUpdateDynamicItemdto';
import { CreateUpdateMultipleStop } from './dto/CreateUpdateMultipleStop.dto';
import { CreateUpdatePayloadFare } from './dto/CreateUpdatePayloadFare.dto';
import { CreateUpdateSetting } from './dto/CreateUpdateSetting.dto';
import { CreateUpdateTruckTypeFare } from './dto/CreateUpdateTruckTypeFare.dto';
import { CreateUpdateZoneFare } from './dto/CreateUpdateZoneFare.dto';
import { GetRequest } from './dto/GetRequest.dto';
import { LicenseMail } from './dto/LicenseMail.dto';
import { ResetPassword } from './dto/ResetPassword.dto';
import { UpdateCommissionSetting } from './dto/UpdateCommissionSetting.dto';
import { UpdateCompany } from './dto/UpdateCompany.dto';
import { AdminUpdateCustomer, UpdateCustomer } from './dto/UpdateCustomer.dto';
import { UpdateDriver } from './dto/UpdateDriver.dto';
import { UpdateLicenseSetting } from './dto/UpdateLicenseSetting.dto';
import { UpdatePricingSetting } from './dto/UpdatePricingSetting.dto';
import { UpdateTruck } from './dto/UpdateTruck.dto';
import {
  AdminUpdateTruckOwner,
  UpdateTruckOwner,
} from './dto/UpdateTruckOwner.dto';

@ApiTags('Admin - User')
@ApiBearerAuth()
@Controller('admin')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AdminAuthenticationGuard)
@SetMetadata(METADATA.MODULE, ADMIN_MODULE)
export class AdminUserController {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly orderService: OrderService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_ADMIN)
  @SetMetadata(METADATA.CONFIDENTIAL_BODY, true)
  createAdminAccount(
    @Body() createModel: CreateAdminDto,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.createAdminAccount(
      createModel,
      (request as any).user.id,
    );
  }

  @ApiBearerAuth()
  @Post('check-token')
  async verifyToken(@Body() model: CheckToken): Promise<LoginResponseDto> {
    const result = await this.adminUserService.verifyToken(model.token);
    return result;
  }

  @ApiBearerAuth()
  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Post('check-reset-token')
  async verifyResetToken(@Body() model: CheckToken): Promise<LoginResponseDto> {
    const result = await this.adminUserService.verifyResetToken(model.token);
    return result;
  }

  @Get('companies')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getCompanies(@Query() model: GetRequest): Promise<any> {
    return this.adminUserService.getCompanies(model);
  }

  @Get('customers/get-favorite-truck-owner/:publicId')
  async getFavoriteTruckOwner(
    @Param('publicId') publicId: string,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.getFavoriteTruckOwner(publicId);
  }

  @Post('customers/add-favorite-truck-owner/:publicId')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADD_FAVORITE_TRUCK_OWNER)
  async addFavoriteTruckOwner(
    @Param('publicId') publicId: string,
    @Body() body: Record<string, any>,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.addFavoriteTruckOwner(
      publicId,
      body.customerId,
      request,
    );
  }

  @ApiBearerAuth()
  @Get('orders/report')
  async getReport(@Query() model: Record<string, any>): Promise<boolean> {
    return await this.adminUserService.getReport(model);
  }

  @ApiBearerAuth()
  @Post('orders/report-orders/export')
  async exportReportOrders(
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const result = await this.adminUserService.exportReportOrders(body);
    return result;
  }

  @ApiBearerAuth()
  @Post('orders/report-truckowners/export')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_EXPORT_REPORT_TRUCK_OWNER)
  async exportReportTruckOwners(
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const result = await this.adminUserService.exportReportTruckOwners(body);
    return result;
  }

  @ApiBearerAuth()
  @Get('orders/completed')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getCompletedOrders(
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return this.adminUserService.getReportOrdersByAdmin(
      filterRequestDto,
      TYPE_REPORT.COMPLETED,
    );
  }

  @ApiBearerAuth()
  @Get('orders/pending')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getPendingOrders(
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return this.adminUserService.getReportOrdersByAdmin(
      filterRequestDto,
      TYPE_REPORT.PENDING,
    );
  }

  @ApiBearerAuth()
  @Get('statistic/customer')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getCustomerStatistics(
    @Query() filterRequestDto: FilterStatisticRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return this.adminUserService.getCustomerStatistics(filterRequestDto);
  }

  @ApiBearerAuth()
  @Get('statistic/truck-owner')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getTruckOwnerStatistics(
    @Query() filterRequestDto: FilterStatisticRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return this.adminUserService.getTruckOwnerStatistics(filterRequestDto);
  }

  @ApiBearerAuth()
  @Get('orders/cancelled')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getCancelledOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return await this.adminUserService.getReportOrdersByAdmin(
      filterRequestDto,
      TYPE_REPORT.CANCELLED,
    );
  }

  @ApiBearerAuth()
  @Get('orders/truckowner')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getTruckOwnerOrders(
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return this.adminUserService.getReportTruckOwnerOrdersByAdmin(
      filterRequestDto,
    );
  }

  @Put('/customers/remove-favorite-truck-owner/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.REMOVE_FAVORITE_TRUCK_OWNER)
  async removeFavoriteTruckOwner(
    @Param('id') id: number,
    @Body() body: Record<string, any>,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.removeFavoriteTruckOwner(
      id,
      body.customerId,
      request,
    );
  }

  @Put('/customers/reset-favorite-truck-owner/')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.RESET_FAVORITE_TRUCK_OWNER)
  async resetFavoriteTruckOwner(
    @Body() body: Record<string, any>,
  ): Promise<boolean> {
    return this.adminUserService.resetFavoriteTruckOwner(body.customerId);
  }

  @Get('/customers/list-favorite-truck-owner/')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getFavoriteTruckOwners(
    @Query() body: Record<string, any>,
  ): Promise<any> {
    return this.adminUserService.listFavoriteTruckOwner(body);
  }

  @Get('/customers/all-list-favorite-truck-owner/')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getAllFavoriteTruckOwners(
    @Query() body: Record<string, any>,
  ): Promise<any> {
    return this.adminUserService.listAllFavoriteTruckOwner(body);
  }

  /* ------------------------------------------

  Customer

   ------------------------------------------ */
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_CUSTOMER)
  @Post('customers')
  createAccount(
    @Body() createUserModel: CreateUserByAdminDto,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.createCustomerAccount(
      createUserModel,
      (request as any).user.id,
    );
  }

  @Get('customers')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getCustomers(@Query() model: GetRequest): Promise<any> {
    return this.adminUserService.getCustomers(model);
  }

  @ApiBearerAuth()
  @Post('customers/export')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_EXPORT_CUSTOMERS)
  async exportCustomers(
    @Body() body: Record<string, any>,
    @Req() request: Request,
  ): Promise<ExportCustomersByAdminDto[]> {
    return this.adminUserService.exportCustomers(body, (request as any).user);
  }

  @Get('customers/deleted')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getDeletedCustomers(@Query() model: GetRequest): Promise<any> {
    return this.adminUserService.getDeletedCustomers(model);
  }

  @Get('/customers/employees')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getEmployees(
    @Query() model: Record<string, any>,
  ): Promise<LoginResponseDto> {
    return this.adminUserService.getEmployees(model);
  }

  @Get('/customers/employee/:id')
  async getEmployeeById(
    @Param('id', ParseIntPipe) id: number,
    @Query() model: Record<string, any>,
  ): Promise<LoginResponseDto> {
    return this.adminUserService.getEmployeeById(id, model.customerId);
  }

  @Put('/customers/employee/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_EMPLOYEE)
  async updateEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: UpdateCustomer,
  ): Promise<LoginResponseDto> {
    return this.adminUserService.updateEmployee(id, model);
  }

  @Post('/customers/add-employee')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.CREATE_EMPLOYEE)
  async addEmployee(@Body() body: Record<string, any>): Promise<any> {
    return this.adminUserService.addEmployee(body);
  }

  @Delete('/customers/:ownerId/employee/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.DELETE_EMPLOYEE)
  async deleteEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Param('ownerId', ParseIntPipe) customerId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteEmployee(id, customerId, request);
  }

  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_VERIFY_CUSTOMER)
  @Put('customers/:id/email-verification')
  verifyCustomerAccount(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.adminUserService.verifyCustomerAccount(id);
  }

  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_VERIFY_TRUCKOWNER)
  @Put('truck-owners/:id/email-verification')
  verifyTruckOwnerAccount(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.adminUserService.verifyTruckOwnerAccount(id);
  }

  /* ------------------------------------------

    TruckOwner

  ------------------------------------------ */

  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_TRUCK_OWNER)
  @Post('truck-owner')
  createTruckOwnerAccount(
    @Body() createUserModel: CreateUserByAdminDto,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.createTruckOwnerAccount(
      createUserModel,
      (request as any).user.id,
    );
  }

  @Get('/truck-owners/all')
  async getAllTruckOwners(): Promise<TruckOwnerResponseDto[]> {
    return this.adminUserService.getAllTruckOwners();
  }

  @Get('truck-owners')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getTruckOwners(
    @Query() model: GetRequest,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.getTruckOwners(
      model,
      (request as any).user.id,
    );
  }

  @ApiBearerAuth()
  @Post('truck-owners/export')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_EXPORT_TRUCKOWNERS)
  async exportTruckOwners(
    @Body() body: Record<string, any>,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.exportTruckOwners(body, (request as any).user);
  }

  @Get('truck-owners/deleted')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getDeletedTruckOwners(@Query() model: GetRequest): Promise<any> {
    return this.adminUserService.getDeletedTruckOwners(model);
  }

  @Get('truck-owner/:truckOwnerId/bank-account')
  async getTruckOwnerBankAccount(
    @Param('truckOwnerId', ParseIntPipe) truckOwnerId: number,
  ): Promise<TruckOwnerBankAccount> {
    return this.adminUserService.getTruckOwnerBankAccount(truckOwnerId);
  }

  @Post('truck-owner/:truckOwnerId/bank-account')
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_CREATE_TRUCK_OWNER_BANK_ACCOUNT,
  )
  async createBankAccount(
    @Body() model: CreateUpdateBankAccount,
    @Param('truckOwnerId', ParseIntPipe) truckOwnerId: number,
  ): Promise<TruckOwnerBankAccount> {
    return this.adminUserService.createTruckOwnerBankAccount(
      model,
      truckOwnerId,
    );
  }

  @Put('truck-owner/:truckOwnerId/bank-account')
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_UPDATE_TRUCK_OWNER_BANK_ACCOUNT,
  )
  async updateBankAccount(
    @Body() model: CreateUpdateBankAccount,
    @Param('truckOwnerId', ParseIntPipe) truckOwnerId: number,
  ): Promise<TruckOwnerBankAccount> {
    return this.adminUserService.updateTruckOwnerBankAccount(
      model,
      truckOwnerId,
    );
  }

  @Get('truck-owners/:id')
  getTruckOwnerDetail(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    return this.adminUserService.getTruckOwnerDetail(
      id,
      (request as any).user.id,
    );
  }

  @Put('truck-owners/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_TRUCK_OWNER)
  updateTruckOwner(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTruckOwnerModel: AdminUpdateTruckOwner,
  ): Promise<boolean> {
    return this.adminUserService.updateTruckOwner(id, updateTruckOwnerModel);
  }

  @Delete('/truck-owners/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_TRUCK_OWNER)
  deleteTruckOwner(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteTruckOwner(id, request);
  }

  @Post('/truck-owners/:id/restore')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_RESTORE_TRUCK_OWNER)
  restoreTruckOwner(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.adminUserService.restoreTruckOwner(id);
  }

  // Front card img
  @Post('truck-owner/:id/upload-card-front')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_CARD_FRONT)
  async updateTruckOwnerFrontCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_FRONT_IMAGE,
    );
  }

  // back card img
  @Post('/truck-owner/:id/upload-card-back')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card back img  upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_CARD_BACK)
  async updateTruckOwnerBackCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_BACK_IMAGE,
    );
  }

  // company icon
  @Post('/truck-owner/:id/upload-company-icon')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Company icon upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_COMPANY_ICON,
  )
  async updateTruckOwnerCompanyIcon(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.COMPANY_ICON,
    );
  }

  // Business license
  @Post('/truck-owner/:id/upload-business-license')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Business license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_BUSINESS_LICENSE,
  )
  async updateTruckOwnerBusinessLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.BUSINESS_LICENSE,
    );
  }

  // Truck certificate
  @Post('/truck-owner/:id/upload-truck-certificate')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Truck certificate upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_TRUCK_CERTIFICATE,
  )
  async updateTruckCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.TRUCK_CERTIFICATE,
    );
  }

  // Driver license
  @Post('/truck-owner/:id/upload-driver-license')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'driver license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_DRIVER_LICENSE,
  )
  async updateTruckDriverLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_LICENSE,
    );
  }

  @Post('/truck-owner/:id/upload-driver-card-front')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_DRIVER_CARD_FRONT,
  )
  async updateTruckOwnerDriverFrontCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_FRONT_IMAGE,
    );
  }

  @Post('/truck-owner/:id/upload-driver-card-back')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_UPLOAD_DRIVER_CARD_BACK,
  )
  async updateTruckOwnerDriverBackCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_BACK_IMAGE,
    );
  }

  @Delete('/truck-owner/files/:id/:type')
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_DELETE_TRUCKOWNER_FILES,
  )
  async deleteTruckOwnerFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFile(targetId, type, request);
  }

  @Delete('/truck-owner/company-files/:id/:type')
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_DELETE_COMPANY_FILES,
  )
  async deleteTruckOwnerCompanyFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFile(targetId, type, request);
  }

  @Delete('/truck-owner/truck-files/:id/:type')
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_DELETE_TRUCK_FILES,
  )
  async deleteTruckFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFile(targetId, type, request);
  }

  @Delete('/truck-owner/driver-files/:id/:type')
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_TRUCKOWNER_DELETE_DRIVER_FILES,
  )
  async deleteDriverFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFile(targetId, type, request);
  }

  // Truck Owner - Company
  @Get('/truck-owner/:id/company')
  getTruckOwnerCompany(
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<CompanyDetailResponse> {
    return this.adminUserService.getTruckOwnerCompany(targetId);
  }

  @Put('/truck-owner/:id/company')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_COMPANY)
  async updateTruckOwnerCompany(
    @Param('id', ParseIntPipe) targetId: number,
    @Body() model: UpdateCompany,
  ): Promise<CompanyDetailResponse> {
    return this.adminUserService.updateTruckOwnerCompany(model, targetId);
  }

  @Post('order/:id/truck-owner')
  @SetMetadata(
    METADATA.ACTION,
    ADMIN_ACTION.ADMIN_ASSIGN_TRUCKOWNER_AS_TRUCKOWNER,
  )
  async assignOrderTruckOwner(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() model: Record<string, any>,
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.addTruckOwnerToOrder(
      orderId,
      model.id,
      request,
    );
  }

  // Truck Owner - Trucks

  @Post('order/:id/trucks')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_ASSIGN_TRUCK_AS_TRUCKOWNER)
  async assignOrderTrucks(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() truckIds: number[],
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.addTrucksToOrder(orderId, truckIds, request);
  }

  @Get('/truck-owner/:id/trucks/all')
  async getAllTrucksByOwnerId(
    @Param('id', ParseIntPipe) ownerId: number,
  ): Promise<TrucksDetailResponse> {
    return this.adminUserService.getAllTrucksByOwnerId(ownerId);
  }

  @Get('/truck-owner/:id/trucks')
  async getTrucksByOwnerId(
    @Param('id', ParseIntPipe) ownerId: number,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<TrucksDetailResponse> {
    return this.adminUserService.getTrucksByOwnerId(ownerId, filterRequestDto);
  }

  @Get('/truck-owner/truck/:id')
  async getTruckById(
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<TrucksDetailResponse> {
    return this.adminUserService.getTruckById(targetId);
  }

  @Post('/truck-owner/:id/truck')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_TRUCK)
  async createTruck(
    @Body() model: CreateTruckDto,
    @Param('id', ParseIntPipe) ownerId: number,
  ): Promise<Truck> {
    return this.adminUserService.createTruck(model, ownerId);
  }

  @Put('/truck-owner/truck/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_TRUCK)
  async updateTruck(
    @Body() model: UpdateTruck,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<TrucksDetailResponse> {
    return this.adminUserService.updateTruck(model, targetId);
  }

  @Delete('/truck-owner/truck/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_TRUCK)
  deleteTruck(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteTruck(id, request);
  }

  @Get('/truck-owner/:id/drivers/all')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getAllTruckOwnerDrivers(
    @Param('id', ParseIntPipe) ownerId: number,
  ): Promise<DriverDetailResponse> {
    return await this.adminUserService.getAllTruckOwnerDrivers(ownerId);
  }

  // Truck Owner - Drivers

  @Post('order/:id/drivers')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_ASSIGN_DRIVER_AS_TRUCKOWNER)
  async assignOrderDrivers(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() driverIds: number[],
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.addDriversToOrder(
      orderId,
      driverIds,
      request,
    );
  }

  @Get('/truck-owner/:id/drivers')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getTruckOwnerDrivers(
    @Param('id', ParseIntPipe) ownerId: number,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<DriverDetailResponse> {
    return await this.adminUserService.getTruckOwnerDrivers(
      ownerId,
      filterRequestDto,
    );
  }

  @Get('/truck-owner/driver/:id')
  async getTruckOwnerDriver(
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<DriverDetailResponse> {
    return await this.adminUserService.getTruckOwnerDriver(targetId);
  }

  @Post('/truck-owner/:id/driver')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_DRIVER)
  async addTruckOwnerDriver(
    @Param('id', ParseIntPipe) ownerId: number,
    @Body() model: TruckOwnerCreateDriver,
  ): Promise<Driver> {
    return this.adminUserService.addTruckOwnerDriver(model, ownerId);
  }

  @Put('/truck-owner/driver/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_DRIVER)
  async updateTruckOwnerDriver(
    @Body() model: UpdateDriver,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<DriverDetailResponse> {
    return this.adminUserService.updateTruckOwnerDriver(model, targetId);
  }

  @Delete('/truck-owner/driver/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_DRIVER)
  async deleteTruckOwnerDriver(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteTruckOwnerDriver(id, request);
  }

  /* ------------------------------------------

    Driver

  ------------------------------------------ */

  @Post('/add-driver')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_DRIVER)
  async addDriver(
    @Body() model: AdminCreateDriver,
    @Req() request: Request,
  ): Promise<Driver> {
    return this.adminUserService.addDriver(model, (request as any).user.id);
  }

  @Get('drivers')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getDrivers(
    @Query() model: GetRequest,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.getDrivers(model, (request as any).user.id);
  }

  @ApiBearerAuth()
  @Post('drivers/export')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_EXPORT_DRIVERS)
  async exportDrivers(
    @Body() body: Record<string, any>,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.exportDrivers(body, (request as any).user);
  }

  @Get('drivers/deleted')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getDeletedDrivers(@Query() model: GetRequest): Promise<any> {
    return this.adminUserService.getDeletedDrivers(model);
  }

  @Get('drivers/:id')
  async getDriversByOwnerId(
    @Param('id', ParseIntPipe) ownerId: number,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<TrucksDetailResponse> {
    return this.adminUserService.getDriversByOwnerId(ownerId, filterRequestDto);
  }

  @Get('driver/:id')
  async getDriver(
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<DriverDetailResponse> {
    return await this.adminUserService.getDriver(
      targetId,
      (request as any).user.id,
    );
  }

  @Delete('/drivers/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_DRIVER)
  deleteDriver(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteDriver(id, request);
  }

  @Post('/drivers/:id/restore')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_RESTORE_DRIVER)
  restoreDriver(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.restoreDriver(id, request);
  }

  @Put('driver/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_DRIVER)
  async updateDriver(
    @Body() model: UpdateDriver,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<DriverDetailResponse> {
    return this.adminUserService.updateDriver(model, targetId);
  }

  @Delete('files/:id/:type')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_FILE)
  async deleteFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFile(targetId, type, request);
  }

  @Post(':id/upload-driver-card-front')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_DRIVER)
  async updateDriverFrontCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_FRONT_IMAGE,
    );
  }

  @Post(':id/upload-driver-card-back')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_DRIVER)
  async updateDriverBackCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_BACK_IMAGE,
    );
  }

  @Delete('/company/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_COMPANY)
  deleteCompany(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteCompany(id, request);
  }

  @ApiBearerAuth()
  @Post(':id/upload-driver-license')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'driver license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_DRIVER)
  async updateDriverLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_LICENSE,
    );
  }

  @Get('drivers-earning')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getDriversEarning(
    @Query() model: GetDriverEarningRequestDto,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.getDriversEarning(model);
  }

  @ApiBearerAuth()
  @Post('driver/:id/payment')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_PAYMENT_DRIVER)
  async payDriverEarning(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: PayDriverEarningRequestDto,
  ): Promise<any> {
    this.adminUserService.payDriverEarning(id, model);
  }

  @Get('driver-payment-history')
  async getDriverPaymentHistory() {
    return true;
  }

  /* ------------------------------------------

    Admin

  ------------------------------------------ */
  @Get('init-super')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  initAdmin(): Promise<boolean> {
    return this.adminUserService.initSuperAdmin();
  }

  @Get('/deleted')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getDeletedAdmins(@Query() model: GetRequest): Promise<any> {
    return this.adminUserService.getDeletedAdmins(model);
  }

  @Get('/accounts')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getAdmins(@Query() model: GetRequest): Promise<any> {
    return this.adminUserService.getAdmins(model);
  }

  @ApiBearerAuth()
  @Get('orders')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getOrders(
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<boolean> {
    return this.orderService.getList(filterRequestDto);
  }

  @ApiBearerAuth()
  @Get('orders-v2')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async getOrdersV2(
    @Query() filterRequestDto: FilterRequestDtoV2,
  ): Promise<boolean> {
    return this.orderService.getListV2(filterRequestDto);
  }

  @ApiBearerAuth()
  @Get('order/:id')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getOrderById(
    @Param('id', ParseIntPipe) orderId: number,
  ): Promise<Order> {
    return this.orderService.getById(orderId);
  }

  @Post('login')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  login(@Body() model: LoginUserDto): Promise<LoginResponseDto> {
    return this.adminUserService.login(model);
  }

  @Delete('/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_ADMIN)
  deleteAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteAdmin(
      id,
      (request as any).user.id,
      request,
    );
  }

  @Post(':id/restore')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_RESTORE_ADMIN)
  restoreAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.restoreAdmin(id, request);
  }

  @Get('forgot-password/:lang')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async forgotPassword(
    @Query('email') email: string,
    @Param('lang') lang: USER_LANGUAGE,
  ): Promise<boolean> {
    return this.adminUserService.forgotPassword(email, lang);
  }

  @Post('reset-password')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async resetPassword(@Body() model: ResetPassword): Promise<boolean> {
    return this.adminUserService.resetPassword(model);
  }

  @ApiBearerAuth()
  @Post(':id/change-password')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CHANGE_PASSWORD)
  async changePassword(
    @Body() model: ChangePassword,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.adminUserService.changePassword(id, model);
  }

  @ApiBearerAuth()
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_ORDER)
  @Post('orders')
  async create(
    @Body() orderRequestDto: OrderRequestDto,
    @Req() request: Request,
  ): Promise<Order> {
    return await this.adminUserService.createOrder(
      orderRequestDto,
      (request as any).user,
      request,
    );
  }

  @ApiBearerAuth()
  @Post('orders/manage/export')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_EXPORT_ORDER)
  async exportManageOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<boolean> {
    return this.adminUserService.exportOrders(
      (request as any).user.id,
      body,
      TYPE_EXPORT_ORDER.MANAGE,
    );
  }

  @ApiBearerAuth()
  @Post('orders/payment/export')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_EXPORT_ORDER)
  async exportPaymentOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<boolean> {
    return this.adminUserService.exportOrders(
      (request as any).user.id,
      body,
      TYPE_EXPORT_ORDER.PAYMENT,
    );
  }

  /* ------------------------------------------

    Customer

  ------------------------------------------ */

  @Get('/customers/company/:id')
  getCustomerCompany(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
    return this.adminUserService.getCustomerCompany(id);
  }

  @Put('/customers/company')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_COMPANY)
  updateCustomerCompany(@Body() body: Record<string, any>): Promise<boolean> {
    return this.adminUserService.updateCustomerCompany(body);
  }

  @Post('/customers/company')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CREATE_COMPANY)
  createCustomerCompany(@Body() body: Record<string, any>): Promise<boolean> {
    return this.adminUserService.createCustomerCompany(body);
  }

  // Front card img
  @Post('/customers/:id/upload-card-front')
  @ApiBearerAuth()
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.UPLOAD_CARD_FRONT)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateFrontCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.CUSTOMER_ID_CARD_FRONT_IMAGE,
      request,
    );
  }

  // back card img
  @ApiBearerAuth()
  @Post('/customers/:id/upload-card-back')
  @ApiConsumes('multipart/form-data')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.UPLOAD_CARD_BACK)
  @ApiBody({
    description: 'Id card back img  upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateBackCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.CUSTOMER_ID_CARD_BACK_IMAGE,
      request,
    );
  }

  @ApiBearerAuth()
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.DELETE_CUSTOMER_FILE)
  @Delete('/customers/files/:id/:type')
  async deleteCustomerFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFile(targetId, type, request);
  }

  @ApiBearerAuth()
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.DELETE_CUSTOMER_COMPANY_FILE)
  @Delete('/customers/company-files/:id/:type')
  async deleteCompanyFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFile(targetId, type, request);
  }

  // company icon
  @ApiBearerAuth()
  @Post('/customers/:id/upload-company-icon')
  @ApiConsumes('multipart/form-data')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.UPLOAD_COMPANY_ICON)
  @ApiBody({
    description: 'Company icon upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateCompanyIcon(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.COMPANY_ICON,
    );
  }

  // Business license
  @ApiBearerAuth()
  @Post('/customers/:id/upload-business-license')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.UPLOAD_BUSINESS_LICENSE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Business license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateBusinessLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.BUSINESS_LICENSE,
    );
  }

  @Get('customers/:id')
  getCustomerDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LoginResponseDto> {
    return this.adminUserService.getCustomerDetail(id);
  }

  @Get('customer-api/:id')
  getCustomerAPI(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.getCustomerAPI(id, (request as any).user);
  }

  @Post('customer-api/:id')
  createCustomerAPI(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.createCustomerAPI(id, (request as any).user);
  }

  @Delete('customer-api/:id')
  deleteCustomerAPI(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<any> {
    return this.adminUserService.deleteCustomerAPI(id, (request as any).user);
  }

  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_CUSTOMER)
  @Put('customers/:id')
  updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerModel: AdminUpdateCustomer,
  ): Promise<boolean> {
    return this.adminUserService.updateCustomer(id, updateCustomerModel);
  }

  @Delete('/customers/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_CUSTOMER)
  deleteCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.deleteCustomer(id, request);
  }

  @Post('/customers/:id/restore')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_RESTORE_CUSTOMER)
  restoreCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.restoreCustomer(id, request);
  }

  @ApiBearerAuth()
  @Put('orders/:id/customer-cancelling')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CANCEL_ORDER_AS_CUSTOMER)
  async customerCancellingOrder(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.customerCancellingOrder(
      orderId,
      request,
    );
  }

  @ApiBearerAuth()
  @Put('orders/:id/driver-cancelling')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_CANCEL_ORDER_AS_DRIVER)
  async driverCancellingOrder(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.driverCancellingOrder(orderId, request);
  }

  @Put('/truck-owner/untake-order/:orderId')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_TRUCKOWNER_UNTAKE_ORDER)
  async untakeOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.adminUserService.untakeOrder(orderId, request);
  }

  @Get('settings')
  async getSettings(): Promise<AdminSetting[]> {
    return await this.adminUserService.getSettings();
  }

  @Get('system-file')
  async getSystemfile(): Promise<any> {
    return await this.adminUserService.getSystemImg();
  }

  @Put('settings')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async updateSettings(@Body() model: any): Promise<boolean> {
    return await this.adminUserService.updateSettings(model);
  }

  @Put('settings/create-order')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async updateCreateOrderSettings(@Body() model: any): Promise<boolean> {
    return await this.adminUserService.updateCreateOrderSettings(model);
  }

  @Put('settings/truck-pool')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async updateTruckPoolSettings(@Body() model: any): Promise<boolean> {
    return await this.adminUserService.updateTruckPoolSettings(model);
  }

  @Get('setting/:type')
  async getSetting(
    @Param('type', ParseIntPipe) type: number,
  ): Promise<AdminSetting> {
    return await this.adminUserService.getSetting(type);
  }

  @Get('/pricing/init')
  async initPriceSetting(): Promise<boolean> {
    return await this.adminUserService.initPriceSetting();
  }

  @Put('/setting')
  async updateSetting(
    @Body() createUpdateSettingModel: CreateUpdateSetting,
  ): Promise<boolean> {
    return await this.adminUserService.createUpdateSetting(
      createUpdateSettingModel,
    );
  }

  @Post('setting')
  async createUpdateSetting(
    @Body() createUpdateSettingModel: CreateUpdateSetting,
  ): Promise<boolean> {
    return await this.adminUserService.createUpdateSetting(
      createUpdateSettingModel,
    );
  }

  @Post('pricing')
  async createPricingSetting(): Promise<boolean> {
    return await this.adminUserService.createPricingSetting();
  }

  @Get('pricing')
  async getPricingSettings(): Promise<[Pricing[], number]> {
    const data = await this.adminUserService.getPricingSettings();
    return data;
  }

  @Put('pricing')
  async updatePricing(
    @Body() pricingSetting: UpdatePricingSetting,
  ): Promise<boolean> {
    return await this.adminUserService.updatePricing(pricingSetting);
  }

  @Get('commission')
  async getCommission(): Promise<any> {
    return await this.adminUserService.getCommission();
  }

  @Put('commission')
  async updateCommission(
    @Body() commissionSetting: UpdateCommissionSetting,
  ): Promise<boolean> {
    return await this.adminUserService.updateCommission(commissionSetting);
  }

  @Get('update-old-price-setting')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async updateOldPriceSetting(): Promise<boolean> {
    return await this.adminUserService.updateOldPriceSetting();
  }

  @Delete('pricing/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_PRICE)
  async deletePriceSetting(
    @Param('id', ParseIntPipe) pricingId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deletePriceSetting(pricingId, request);
  }

  @Put('/truck-type-fare/:id')
  async updateTruckTypeFare(
    @Param('id', ParseIntPipe) truckTypeFareId: number,
    @Body() model: CreateUpdateTruckTypeFare,
  ): Promise<boolean> {
    return await this.adminUserService.updateTruckTypeFare(
      model,
      truckTypeFareId,
    );
  }

  @Delete('/truck-type-fare/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_TRUCK_TYPE_FARE)
  async deleteTruckTypeFare(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteTruckTypeFare(id, request);
  }

  @Post('/truck-type-fare/pricing/:priceSettingId')
  async addTruckTypeFare(
    @Param('priceSettingId', ParseIntPipe) priceSettingId: number,
  ): Promise<boolean> {
    return await this.adminUserService.addTruckTypeFare(priceSettingId);
  }

  @Put('/payload/:id')
  async updatePayloadFare(
    @Param('id', ParseIntPipe) payloadFareId: number,
    @Body() model: CreateUpdatePayloadFare,
  ): Promise<boolean> {
    return await this.adminUserService.updatePayloadFare(model, payloadFareId);
  }

  @Delete('/payload/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_PAYLOAD_FARE)
  async deletePayloadFare(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deletePayloadFare(id, request);
  }

  @Post('/payload/pricing/:priceSettingId')
  async addPayloadFare(
    @Param('priceSettingId', ParseIntPipe) priceSettingId: number,
  ): Promise<boolean> {
    return await this.adminUserService.addPayloadFare(priceSettingId);
  }

  @Put('/zone/:id')
  async updateZonePrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: CreateUpdateZoneFare,
  ): Promise<boolean> {
    return await this.adminUserService.updateZoneFare(model, id);
  }

  @Post('/zone/:priceSettingId')
  async createZoneFare(
    @Param('priceSettingId', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.adminUserService.createZoneFare(id);
  }

  @Delete('/zone/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_ZONE_FARE)
  async deleteZonefare(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteZoneFare(id, request);
  }

  @Put('/dynamic-items/:id')
  async updateDynamicItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: CreateUpdateDynamicItem,
  ): Promise<boolean> {
    return await this.adminUserService.updateDynamicItem(model, id);
  }

  @Post('/dynamic-items/:priceSettingId')
  async createDynamicItem(
    @Param('priceSettingId', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.adminUserService.createDynamicItem(id);
  }

  @Delete('/dynamic-items/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_DYNAMIC_ITEM)
  async deleteDynamicItems(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteDynamicItem(id, request);
  }

  @Put('/multiple-stops/:id')
  async updateMultipleStops(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: CreateUpdateMultipleStop,
  ): Promise<boolean> {
    return await this.adminUserService.updateMultipleStops(model, id);
  }

  @Post('/multiple-stops/:priceSettingId')
  async createMultipleStops(
    @Param('priceSettingId', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.adminUserService.addMultipleStops(id);
  }

  @Delete('/multiple-stops/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_DYNAMIC_ITEM)
  async deleteMultipleStops(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteMultipleStops(id, request);
  }

  @Post('/distance-price/:priceSettingId')
  async createDistancePrice(
    @Param('priceSettingId', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.adminUserService.createDistancePrice(id);
  }

  @Delete('/distance-price/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_DISTANCE_PRICE)
  async deleteDistanceFare(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteDistancePrice(id, request);
  }

  @Put('/distance-price/:id')
  async updateDistancePrice(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: CreateUpdateDistancePrice,
  ): Promise<boolean> {
    return await this.adminUserService.updateDistancePrice(model, id);
  }

  @Get('/distance-price/:id/distances')
  async getDistances(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<[Distance[], number]> {
    return await this.adminUserService.getDistances(id);
  }

  @Post('/distance-price/:id/distances')
  async createDistance(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return await this.adminUserService.createDistance(id);
  }

  @Delete('/distances/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_DISTANCE)
  async deleteDistance(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteDistance(id, request);
  }

  @Put('payment-done/truck-owner/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.UPDATE_PAYMENT_DONE)
  async updatePaymentDoneByTruckOwner(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() model: PaymentDoneDto,
  ): Promise<boolean> {
    return await this.adminUserService.updatePaymentDoneByTruckOwner(
      orderId,
      model,
    );
  }

  @Put('payment-done/customer/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.UPDATE_PAYMENT_DONE)
  async updatePaymentDoneByCustomer(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() model: PaymentDoneDto,
  ): Promise<boolean> {
    return await this.adminUserService.updatePaymentDoneByCustomer(
      orderId,
      model,
    );
  }

  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Get('init-settings')
  async initSettings(): Promise<boolean> {
    return await this.adminUserService.initSettings();
  }

  @Post('upgrade-license-request')
  async upgradeLicenseRequest(@Body() model: LicenseMail): Promise<void> {
    return await this.adminUserService.upgradeLicenseRequest(model);
  }

  @Get('license-settings')
  async getLicenseSettings(): Promise<Settings> {
    return await this.adminUserService.getLicenseSettings();
  }

  @Put('license-settings')
  async updateLicenseSettings(
    @Body() model: UpdateLicenseSetting,
  ): Promise<boolean> {
    return await this.adminUserService.updateLicenseSettings(model);
  }

  @Get('/:id')
  getAdminsById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.adminUserService.getAdminDetail(id);
  }

  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_ADMIN)
  @Put('/:id')
  updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminModel: Record<string, any>,
  ): Promise<boolean> {
    return this.adminUserService.updateAdmin(id, updateAdminModel);
  }

  @ApiBearerAuth()
  @Put('truck-owner/:id')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_TRUCKOWNER_PROFILE)
  async updateTruckOwnerProfile(
    @Body() model: UpdateTruckOwner,
    @Param('id', ParseIntPipe) truckOwnerId: number,
  ): Promise<LoginResponseDto> {
    return this.adminUserService.updateTruckOwnerProfile(model, truckOwnerId);
  }

  @Post(':id/upload-driver-doc')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFiles,
  })
  @UseInterceptors(FilesInterceptor('images[]', 3, multerOptions))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.UPLOAD_DRIVER_OTHER_DOC)
  async updateDriverOtherMulDoc(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.uploadMultipleFile(
      files,
      targetId,
      REFERENCE_TYPE.OTHER_DRIVER_DOCUMENT,
      request,
    );
  }

  @Delete('files/other-doc/:id/:fileId/:type')
  async deleteFileByFileId(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('fileId') fileId: string,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteFileByFileId(
      targetId,
      fileId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @Post('update-logo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'upload logo, qr code img',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptionsLogo))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_LOGO)
  async updateLogo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      null,
      REFERENCE_TYPE.CUSTOMER_LOGO,
    );
  }

  @Post('update-qr')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'upload logo, qr code img',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_UPDATE_LOGO)
  async updateQr(@UploadedFile() file: Express.Multer.File): Promise<boolean> {
    return await this.adminUserService.uploadFile(
      file,
      null,
      REFERENCE_TYPE.FOOTER_QR,
    );
  }

  @Delete('system-files/:type')
  @SetMetadata(METADATA.ACTION, ADMIN_ACTION.ADMIN_DELETE_FILE)
  async deleteFiles(
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.adminUserService.deleteSystemFile(type, request);
  }
}

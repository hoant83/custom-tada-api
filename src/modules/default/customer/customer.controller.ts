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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  CUSTOMER_ACTION,
  CUSTOMER_MODULE,
} from 'src/common/constants/actions/customer/customer.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { TYPE_EXPORT_ORDER } from 'src/common/constants/type-export.enum';
import { TYPE_REPORT } from 'src/common/constants/type-report.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { CustomerAuthenticationGuard } from 'src/common/guards/customerAuthentication.guard';
import { multerOptions } from 'src/common/helpers/utility.helper';
import { CompanyDetailResponse } from 'src/dto/company/CompanyDetail.dto';
import { CreateCompanyDto } from 'src/dto/company/CreateCompany.dto';
import { DefaultReferenceDto } from 'src/dto/defaultReference/DefaultRef.dto';
import { UploadFile } from 'src/dto/file/UploadFile.dto';
import {
  FilterRequestDto,
  FilterRequestDtoV2,
} from 'src/dto/order/filter-request.dto';
import { OrderRequestDto } from 'src/dto/order/order-request.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { DefaultPaymentDto } from 'src/dto/payment/DefaultPayment.dto';
import { ChangePassword } from 'src/dto/users/ChangePassword.dto';
import { CheckToken } from 'src/dto/users/CheckToken.dto';
import { CreateUserDto } from 'src/dto/users/CreateUser.dto';
import { ExportOrdersByCustomerDto } from 'src/dto/users/ExportOrdersByCustomer.dto';
import { ExportOrdersByCustomerNewDto } from 'src/dto/users/ExportOrdersByCustomerNew.dto';
import { LoginResponseDto } from 'src/dto/users/LoginResponse.dto';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { DefaultReference } from 'src/entities/default-reference/default-reference.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { Order } from 'src/entities/order/order.entity';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { UpdateCompany } from 'src/modules/admin/user/dto/UpdateCompany.dto';
import { UpdateCustomer } from 'src/modules/admin/user/dto/UpdateCustomer.dto';
import { PaymentDoneDto } from '../../../dto/order/payment-done.dto';
import { GetRequest } from '../../admin/user/dto/GetRequest.dto';
import { ResetPassword } from '../../admin/user/dto/ResetPassword.dto';
import { SetPassword } from '../../admin/user/dto/SetPassword.dto';
import { OrderService } from '../order/order.service';
import { CustomerService } from './customer.service';

@ApiTags('Customer - User')
@Controller('customer')
@UseGuards(CustomerAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SetMetadata(METADATA.MODULE, CUSTOMER_MODULE)
export class CustomerController {
  constructor(
    private readonly userService: CustomerService,
    private readonly orderService: OrderService,
  ) {}
  @Get('info')
  async getTruckOwner(@Req() request: Request): Promise<LoginResponseDto> {
    return this.userService.getUser((request as any).user.id);
  }

  @ApiBearerAuth()
  @Post('check-token')
  async verifyToken(@Body() model: CheckToken): Promise<LoginResponseDto> {
    const result = await this.userService.verifyToken(model.token);
    return result;
  }

  @ApiBearerAuth()
  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Post('check-reset-token')
  async verifyResetToken(@Body() model: CheckToken): Promise<LoginResponseDto> {
    const result = await this.userService.verifyResetToken(model.token);
    return result;
  }

  @Delete('files/:id/:type')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.DELETE_FILE)
  async deleteFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.deleteFile(
      targetId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @Delete('company-files/:id/:type')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.DELETE_COMPANY_FILE)
  async deleteCompanyFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.deleteCompanyFile(
      targetId,
      type,
      (request as any).user.id,
      request,
    );
  }

  // Front card img
  @Post(':id/upload-card-front')
  @ApiBearerAuth()
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPLOAD_CARD_FRONT)
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
    return await this.userService.uploadFile(
      file,
      targetId,
      (request as any).user.id, // request.body.userId for testing
      REFERENCE_TYPE.CUSTOMER_ID_CARD_FRONT_IMAGE,
    );
  }

  // back card img
  @ApiBearerAuth()
  @Post(':id/upload-card-back')
  @ApiConsumes('multipart/form-data')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPLOAD_CARD_BACK)
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
    return await this.userService.uploadFile(
      file,
      targetId,
      (request as any).user.id,
      REFERENCE_TYPE.CUSTOMER_ID_CARD_BACK_IMAGE,
    );
  }

  @Post(':id/upload-profile-img')
  @ApiBearerAuth()
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPLOAD_CARD_FRONT)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateProfileImg(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.uploadFile(
      file,
      targetId,
      (request as any).user.id, // request.body.userId for testing
      REFERENCE_TYPE.CUSTOMER_PROFILE_IMG,
    );
  }

  // company icon
  @ApiBearerAuth()
  @Post(':id/upload-company-icon')
  @ApiConsumes('multipart/form-data')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPLOAD_COMPANY_ICON)
  @ApiBody({
    description: 'Company icon upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateCompanyIcon(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.uploadFile(
      file,
      targetId,
      (request as any).user.id,
      REFERENCE_TYPE.COMPANY_ICON,
    );
  }

  // Business license
  @ApiBearerAuth()
  @Post(':id/upload-business-license')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPLOAD_BUSINESS_LICENSE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Business license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateBusinessLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.uploadFile(
      file,
      targetId,
      (request as any).user.id,
      REFERENCE_TYPE.BUSINESS_LICENSE,
    );
  }

  // Truck certificate
  @ApiBearerAuth()
  @Post(':id/upload-truck-certificate')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Truck certificate upload',
    type: UploadFile,
  })
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPLOAD_TRUCK_CERTIFICATE)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateTruckCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.uploadFile(
      file,
      targetId,
      (request as any).user.id,
      REFERENCE_TYPE.TRUCK_CERTIFICATE,
    );
  }

  // Driver license
  @ApiBearerAuth()
  @Post(':id/upload-driver-license')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPLOAD_DRIVER_LICENSE)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'driver license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async updateDriverLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.uploadFile(
      file,
      targetId,
      (request as any).user.id,
      REFERENCE_TYPE.DRIVER_LICENSE,
    );
  }

  @Post('login')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  login(@Body() model: LoginUserDto): Promise<LoginResponseDto> {
    return this.userService.login(model);
  }

  @ApiBearerAuth()
  @Post(':id/change-user-password')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.CHANGE_PASSWORD)
  async changeUserPassword(
    @Body() model: ChangePassword,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.userService.changeUserPassword((request as any).user.id, model);
  }

  @ApiBearerAuth()
  @Post(':id/change-password')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.CHANGE_PASSWORD)
  async changePassword(
    @Body() model: ChangePassword,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.userService.changePassword(id, model);
  }

  @Get('forgot-password/:lang')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async forgotPassword(
    @Query('email') email: string,
    @Param('lang') lang: USER_LANGUAGE,
  ): Promise<boolean> {
    return this.userService.forgotPassword(email, lang);
  }

  @Post('reset-password')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async resetPassword(@Body() model: ResetPassword): Promise<boolean> {
    return this.userService.resetPassword(model);
  }

  @Post('set-password')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.SET_PASSWORD)
  async setPassword(@Body() model: SetPassword): Promise<boolean> {
    return this.userService.setPassword(model);
  }

  /* ------------------------------------------

  Company

  ------------------------------------------ */

  @Post('/company')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.CREATE_COMPANY)
  async createCompany(
    @Body() model: CreateCompanyDto,
    @Req() request: Request,
  ): Promise<CompanyDetailResponse> {
    return this.userService.createCompany(model, (request as any).user.id);
  }

  @Put('/company')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.EDIT_COMPANY)
  async updateCompany(
    @Body() model: UpdateCompany,
    @Req() request: Request,
  ): Promise<CompanyDetailResponse> {
    return this.userService.updateCompany(model, (request as any).user.id);
  }

  @Get('company')
  async getCompany(@Req() request: Request): Promise<CompanyDetailResponse> {
    return this.userService.getCompany((request as any).user.id);
  }

  @Get('employees')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getEmployees(
    @Query() model: GetRequest,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    return this.userService.getEmployees(model, (request as any).user.id);
  }

  @Get('employee/:id')
  async getEmployeeById(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    return this.userService.getEmployeeById(id, (request as any).user.id);
  }

  @Post('add-employee')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.CREATE_EMPLOYEE)
  async addEmployee(
    @Body() model: Record<string, any>,
    @Req() request: Request,
  ): Promise<any> {
    return this.userService.addEmployee(model, (request as any).user.id);
  }

  @Delete('employee/:id')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.DELETE_EMPLOYEE)
  async deleteEmployee(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.userService.deleteEmployee(
      id,
      (request as any).user.id,
      request,
    );
  }

  /* ------------------------------------------

  favorite truck owners

  ------------------------------------------ */
  @Get('/get-favorite-truck-owner/:publicId')
  async getFavoriteTruckOwner(
    @Param('publicId') publicId: string,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.userService.getFavoriteTruckOwner(publicId);
  }

  @Post('/add-favorite-truck-owner/:publicId')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.ADD_FAVORITE_TRUCK_OWNER)
  async addFavoriteTruckOwner(
    @Param('publicId') publicId: string,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.userService.addFavoriteTruckOwner(
      publicId,
      (request as any).user.id,
      request,
    );
  }

  @Put('/remove-favorite-truck-owner/:id')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.REMOVE_FAVORITE_TRUCK_OWNER)
  async removeFavoriteTruckOwner(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.userService.removeFavoriteTruckOwner(
      id,
      (request as any).user.id,
    );
  }

  @Put('/reset-favorite-truck-owner/')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.RESET_FAVORITE_TRUCK_OWNER)
  async resetFavoriteTruckOwner(@Req() request: Request): Promise<boolean> {
    return this.userService.resetFavoriteTruckOwner((request as any).user.id);
  }

  @Get('/list-favorite-truck-owner/')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getFavoriteTruckOwners(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<any> {
    return this.userService.listFavoriteTruckOwner(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  /* ------------------------------------------

  Order

  ------------------------------------------ */
  @ApiBearerAuth()
  @Get('orders')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[Order[], number]> {
    return await this.userService.getOrders(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @ApiBearerAuth()
  @Get('orders-v2')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getOrdersV2(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDtoV2,
  ): Promise<[Order[], number]> {
    return await this.userService.getOrdersV2(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @ApiBearerAuth()
  @Get('orders/payment')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getOrdersPayment(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[Order[], number]> {
    return await this.userService.getOrdersPayment(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @ApiBearerAuth()
  @Get('orders/completed')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getCompletedOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return await this.userService.getReportOrders(
      (request as any).user.id,
      filterRequestDto,
      TYPE_REPORT.COMPLETED,
    );
  }

  @ApiBearerAuth()
  @Get('orders/pending')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getPendingOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return await this.userService.getReportOrders(
      (request as any).user.id,
      filterRequestDto,
      TYPE_REPORT.PENDING,
    );
  }

  @ApiBearerAuth()
  @Get('orders/cancelled')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getCancelledOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return await this.userService.getReportOrders(
      (request as any).user.id,
      filterRequestDto,
      TYPE_REPORT.CANCELLED,
    );
  }

  @ApiBearerAuth()
  @Get('orders/truckowner')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getTruckOwnerOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return await this.userService.getReportTruckOwnerOrders(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @ApiBearerAuth()
  @Get('order/:id')
  async getOrderById(
    @Param('id', ParseIntPipe) orderId: number,
  ): Promise<OrderResponseDto> {
    return this.orderService.getById(orderId);
  }

  @ApiBearerAuth()
  @Post('orders')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.CREATE_ORDER)
  async create(
    @Body() orderRequestDto: OrderRequestDto,
    @Req() request: Request,
  ): Promise<Order> {
    return await this.orderService.createOrder(
      orderRequestDto,
      (request as any).user,
      request,
    );
  }

  @ApiBearerAuth()
  @Post('orders/manage/export')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.EXPORT_ORDER)
  async exportManageOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerNewDto[]> {
    const result = await this.userService.exportOrders(
      (request as any).user.id,
      body,
      TYPE_EXPORT_ORDER.MANAGE,
    );
    return result;
  }

  @ApiBearerAuth()
  @Post('orders/payment/export')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.EXPORT_ORDER)
  async exportPaymentOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerNewDto[]> {
    const result = await this.userService.exportOrders(
      (request as any).user.id,
      body,
      TYPE_EXPORT_ORDER.PAYMENT,
    );
    return result;
  }

  @ApiBearerAuth()
  @Post('orders/report-orders/export')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.EXPORT_REPORT)
  async exportReportOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const result = await this.userService.exportReportOrders(
      (request as any).user.id,
      body,
    );
    return result;
  }

  @ApiBearerAuth()
  @Post('orders/report-truckowners/export')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.EXPORT_REPORT)
  async exportReportTruckOwners(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByCustomerDto[]> {
    const result = await this.userService.exportReportTruckOwners(
      (request as any).user.id,
      body,
    );
    return result;
  }

  @ApiBearerAuth()
  @Put('orders/:id/cancel-order')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.CANCEL_ORDER)
  async cancelOrderByCustomer(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.userService.cancelOrderByCustomer(orderId, request);
  }

  @ApiBearerAuth()
  @Get('orders/report')
  async getReport(
    @Req() request: Request,
    @Query() model: Record<string, any>,
  ): Promise<boolean> {
    return await this.userService.getReport((request as any).user.id, model);
  }

  @Post(':lang')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  createAccount(
    @Body() createUserModel: CreateUserDto,
    @Param('lang') lang: USER_LANGUAGE,
  ): Promise<boolean> {
    return this.userService.registerAccount(createUserModel, lang);
  }

  @Put('default-reference')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPDATE_DEFAULT_REF)
  updateDefaultRef(
    @Body() deafaultRefModel: DefaultReferenceDto,
    @Req() request: Request,
  ): Promise<DefaultReference> {
    return this.userService.updateRef(
      deafaultRefModel,
      (request as any).user.id,
    );
  }

  @Get('init-old-ref')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  initOldCustomerRef(): Promise<boolean> {
    return this.userService.initOldCustomerRef();
  }

  @Get('default-reference')
  getDefaultReference(@Req() request: Request): Promise<DefaultReference> {
    return this.userService.getDefaultReference((request as any).user.id);
  }

  @Put('default-payment')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPDATE_PAYMENT)
  updatePayment(
    @Body() deafaultPaymentModel: DefaultPaymentDto,
    @Req() request: Request,
  ): Promise<DefaultPayment> {
    return this.userService.updatePayment(
      deafaultPaymentModel,
      (request as any).user.id,
    );
  }

  @Get('init-old-payment')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  initOldPayment(): Promise<boolean> {
    return this.userService.initOldPayment();
  }

  @Get('default-payment')
  getPayment(@Req() request: Request): Promise<DefaultPayment> {
    return this.userService.getDefaultPayment((request as any).user.id);
  }

  @Put('payment-done/:id')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPDATE_PAYMENT_DONE)
  async updatePaymentDone(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() model: PaymentDoneDto,
  ): Promise<boolean> {
    return await this.userService.updatePaymentDone(orderId, model);
  }

  @ApiBearerAuth()
  @Put(':id')
  @SetMetadata(METADATA.ACTION, CUSTOMER_ACTION.UPDATE_PROFILE)
  async updateProfile(
    @Body() model: UpdateCustomer,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<LoginResponseDto> {
    return this.userService.updateProfile(model, targetId);
  }
}

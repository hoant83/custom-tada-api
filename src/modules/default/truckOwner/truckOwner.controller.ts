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
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import {
  TRUCK_OWNER_ACTION,
  TRUCK_OWNER_MODULE,
} from 'src/common/constants/actions/truck-owner/truck-owner.action';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { TYPE_TRUCKOWNER_ORDER } from 'src/common/constants/truckowner-order.enum';
import { TYPE_REPORT } from 'src/common/constants/type-report.enum';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { TruckOwnerAuthenticationGuard } from 'src/common/guards/truckOwnerAuthentication.guard';
import { multerOptions } from 'src/common/helpers/utility.helper';
import { GetDriverEarningRequestDto } from 'src/dto/commission/GetDriverEarningRequest.dto';
import { PayDriverEarningRequestDto } from 'src/dto/commission/PayDriverEarningRequest.dto';
import { CompanyDetailResponse } from 'src/dto/company/CompanyDetail.dto';
import { CreateCompanyDto } from 'src/dto/company/CreateCompany.dto';
import { DriverDetailResponse } from 'src/dto/driver/DriverDetail.dto';
import { FilterRequestDto } from 'src/dto/driver/filter-request.dto';
import { OtpVerification } from 'src/dto/driver/OtpVerification.dto';
import { TruckOwnerCreateDriver } from 'src/dto/driver/TruckOwnerCreateDriver.dto';
import { UploadFile, UploadFiles } from 'src/dto/file/UploadFile.dto';
import { JobsResponseDto } from 'src/dto/jobs/JobsResponse.dto';
import { OrderResponseDto } from 'src/dto/order/OrderResponse.dto';
import { PaymentDoneDto } from 'src/dto/order/payment-done.dto';
import { TrucksDetailResponse } from 'src/dto/truck/TrucksDetail.dto';
import { AssignOrderDto } from 'src/dto/truckOwner/assign-order.dto';
import { CreateUpdateBankAccount } from 'src/dto/truckOwner/bankAccount/CreateUpdateBankAccount.dto';
import { CreateTruckDto } from 'src/dto/truckOwner/CreateTruck.dto';
import { ExportOrdersByTruckOwnerDto } from 'src/dto/truckOwner/ExportOrdersByTruckOwner.dto';
import { ChangePassword } from 'src/dto/users/ChangePassword.dto';
import { CheckToken } from 'src/dto/users/CheckToken.dto';
import { CreateUserDto } from 'src/dto/users/CreateUser.dto';
import { LoginResponseDto } from 'src/dto/users/LoginResponse.dto';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { Driver } from 'src/entities/driver/driver.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { Order } from 'src/entities/order/order.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { ResetPassword } from 'src/modules/admin/user/dto/ResetPassword.dto';
import { UpdateCompany } from 'src/modules/admin/user/dto/UpdateCompany.dto';
import { UpdateDriver } from 'src/modules/admin/user/dto/UpdateDriver.dto';
import { UpdateTruck } from 'src/modules/admin/user/dto/UpdateTruck.dto';
import { UpdateTruckOwner } from 'src/modules/admin/user/dto/UpdateTruckOwner.dto';
import { Repository } from 'typeorm';
import { OrderService } from '../order/order.service';
import { TruckOwnerService } from './truckOwner.service';

@ApiTags('Truck Owner - User')
@Controller('truck-owner')
@UseGuards(TruckOwnerAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SetMetadata(METADATA.MODULE, TRUCK_OWNER_MODULE)
export class TruckOwnerController {
  constructor(
    private readonly truckOwnerService: TruckOwnerService,
    private readonly orderService: OrderService,
    @InjectRepository(TruckOwnerBankAccount)
    private readonly truckOwnerBankAccountRepository: Repository<
      TruckOwnerBankAccount
    >,
  ) {}
  @Get('info')
  async getTruckOwner(@Req() request: Request): Promise<LoginResponseDto> {
    return this.truckOwnerService.getTruckOwner((request as any).user.id);
  }

  @ApiBearerAuth()
  @Post('check-token')
  async verifyLoginToken(@Body() model: CheckToken): Promise<LoginResponseDto> {
    const result = await this.truckOwnerService.verifyToken(model.token);
    return result;
  }

  @ApiBearerAuth()
  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Post('check-reset-token')
  async verifyResetToken(@Body() model: CheckToken): Promise<LoginResponseDto> {
    const result = await this.truckOwnerService.verifyResetToken(model.token);
    return result;
  }

  // Bank account

  @Post('bank-account')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.CREATE_BANK_ACCOUNT)
  async createBankAccount(
    @Body() model: CreateUpdateBankAccount,
    @Req() request: Request,
  ): Promise<TruckOwnerBankAccount> {
    return this.truckOwnerService.createBankAccount(
      model,
      (request as any).user.id,
    );
  }

  @Put('bank-account')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPDATE_BANK_ACCOUNT)
  async updateBankAccount(
    @Body() model: CreateUpdateBankAccount,
    @Req() request: Request,
  ): Promise<TruckOwnerBankAccount> {
    return this.truckOwnerService.updateBankAccount(
      model,
      (request as any).user.id,
    );
  }

  @Get('bank-account')
  async getBankAccount(
    @Req() request: Request,
  ): Promise<TruckOwnerBankAccount> {
    return this.truckOwnerService.getBankAccount((request as any).user.id);
  }

  // Front card img
  @Post(':id/upload-card-front')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_CARD_FRONT)
  async updateFrontCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_FRONT_IMAGE,
    );
  }

  // back card img
  @ApiBearerAuth()
  @Post(':id/upload-card-back')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card back img  upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_CARD_BACK)
  async updateBackCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.TRUCK_OWNER_ID_CARD_BACK_IMAGE,
    );
  }

  @ApiBearerAuth()
  @Post(':id/upload-profile-img')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card back img  upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_PROFILE_PICTURE)
  async updateProfileCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.TRUCK_OWNER_PROFILE_IMG,
    );
  }

  // company icon
  @ApiBearerAuth()
  @Post(':id/upload-company-icon')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Company icon upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_COMPANY_ICON)
  async updateCompanyIcon(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.COMPANY_ICON,
    );
  }

  // Business license
  @ApiBearerAuth()
  @Post(':id/upload-business-license')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Business license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_BUSINESS_LICENSE)
  async updateBusinessLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadFile(
      file,
      targetId,
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
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_TRUCK_CERTIFICATE)
  async updateTruckCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.TRUCK_CERTIFICATE,
    );
  }

  // Driver license
  @ApiBearerAuth()
  @Post(':id/upload-driver-license')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'driver license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_DRIVER_LICENSE)
  async updateDriverLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_LICENSE,
    );
  }

  @Delete('files/:id/:type')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.DELETE_FILE)
  async deleteFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.deleteFile(
      targetId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @Delete('company-files/:id/:type')
  async deleteCompanyFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.deleteCompanyFile(
      targetId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @Delete('truck-files/:id/:type')
  async deleteTruckFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.deleteTruckFile(
      targetId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @Delete('driver-files/:id/:type')
  async deleteDriverFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.deleteDriverFile(
      targetId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @Post('login')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  login(@Body() model: LoginUserDto): Promise<LoginResponseDto> {
    return this.truckOwnerService.login(model);
  }

  @ApiBearerAuth()
  @Post(':id/change-user-password')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.CHANGE_PASSWORD)
  async changeUserPassword(
    @Body() model: ChangePassword,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.truckOwnerService.changeUserPassword(
      (request as any).user.id,
      model,
    );
  }

  @ApiBearerAuth()
  @Post(':id/change-password')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.CHANGE_PASSWORD)
  async changePassword(
    @Body() model: ChangePassword,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<boolean> {
    return this.truckOwnerService.changePassword(id, model);
  }

  @Get('forgot-password/:lang')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async forgotPassword(
    @Query('email') email: string,
    @Param('lang') lang: USER_LANGUAGE,
  ): Promise<boolean> {
    return this.truckOwnerService.forgotPassword(email, lang);
  }

  @Post('reset-password')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async resetPassword(@Body() model: ResetPassword): Promise<boolean> {
    return this.truckOwnerService.resetPassword(model);
  }

  /**
   * OTP
   */

  @Post('otp-verification')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async otpVerification(@Body() model: OtpVerification): Promise<boolean> {
    return await this.truckOwnerService.verifyOtp(model);
  }

  @Get('send-otp')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async sendOtp(@Query('phone') phone: string): Promise<boolean> {
    return await this.truckOwnerService.sendOtp(phone);
  }

  /*
   * MAIL
   */
  @Post('send-mail-verification/:phoneNumber')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async mailVerification(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<boolean> {
    return await this.truckOwnerService.sendMailVerify(phoneNumber);
  }

  /* ------------------------------------------

    Company

  ------------------------------------------ */

  @Post('/company')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.CREATE_COMPANY)
  async createCompany(
    @Body() model: CreateCompanyDto,
    @Req() request: Request,
  ): Promise<CompanyDetailResponse> {
    return this.truckOwnerService.createCompany(
      model,
      (request as any).user.id,
    );
  }

  @Put('/company')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPDATE_COMPANY)
  async updateCompany(
    @Body() model: UpdateCompany,
    @Req() request: Request,
  ): Promise<CompanyDetailResponse> {
    return this.truckOwnerService.updateCompany(
      model,
      (request as any).user.id,
    );
  }

  @Put('/accept-order/:orderId')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.ACCEPT_ORDER)
  async acceptOrder(
    @Req() request: Request,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<boolean> {
    return this.truckOwnerService.acceptOrder(
      (request as any).user.id,
      orderId,
      request,
    );
  }

  @Put('/untake-order/:orderId')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UNTAKE_ORDER)
  async untakeOrder(
    @Req() request: Request,
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<boolean> {
    return this.truckOwnerService.untakeOrder(
      (request as any).user.id,
      orderId,
      request,
    );
  }

  @Put('/assign-order/:orderId')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.ASSIGN_ORDER)
  async assignOrder(
    @Req() request: Request,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() model: AssignOrderDto,
  ): Promise<boolean> {
    return this.truckOwnerService.assignOrder(
      (request as any).user.id,
      orderId,
      model.truckIds,
      model.driverIds,
      request,
    );
  }

  @Put('/assign-and-dispatch-order/:orderId')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.ASSIGN_AND_DISPATCH_ORDER)
  async assignAndDispatch(
    @Req() request: Request,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() model: AssignOrderDto,
  ): Promise<boolean> {
    return this.truckOwnerService.assignOrderAndDispatch(
      (request as any).user.id,
      orderId,
      model.truckIds,
      model.driverIds,
      request,
    );
  }

  @Get('company')
  async getCompany(@Req() request: Request): Promise<CompanyDetailResponse> {
    return this.truckOwnerService.getCompany((request as any).user.id);
  }

  /* ------------------------------------------

   Truck

  ------------------------------------------ */

  @Post('trucks')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.CREATE_TRUCK)
  async createTruck(
    @Body() model: CreateTruckDto,
    @Req() request: Request,
  ): Promise<Truck> {
    return this.truckOwnerService.createTruck(model, (request as any).user.id);
  }

  @Get('trucks/:id')
  async getTruck(
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<TrucksDetailResponse> {
    return this.truckOwnerService.getTruck((request as any).user.id, targetId);
  }

  @Get('trucks')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getTrucks(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<TrucksDetailResponse> {
    return this.truckOwnerService.getTrucks(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @Delete('/truck/:id')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.DETELE_TRUCK)
  deleteTruck(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.truckOwnerService.deleteTruck(
      id,
      (request as any).user.id,
      request,
    );
  }

  @Delete('/driver/:id')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.DETELE_DRIVER)
  deleteDriver(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.truckOwnerService.deleteDriver(
      id,
      (request as any).user.id,
      request,
    );
  }

  @Put('trucks/:id')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPDATE_TRUCK)
  async updateTruck(
    @Body() model: UpdateTruck,
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<TrucksDetailResponse> {
    return this.truckOwnerService.updateTruck(
      model,
      (request as any).user.id,
      targetId,
    );
  }

  @ApiBearerAuth()
  @Put(':id')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPDATE_PROFILE)
  async updateProfile(
    @Body() model: UpdateTruckOwner,
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<LoginResponseDto> {
    return this.truckOwnerService.updateProfile(
      model,
      targetId,
      (request as any).user.id,
    );
  }

  @ApiBearerAuth()
  @Get(':id/orders')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getListOrder(
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[Order[], number]> {
    return this.truckOwnerService.getListOrders(
      targetId,
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @ApiBearerAuth()
  @Get('customer/:id')
  async getCustomerInfo(
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<LoginResponseDto> {
    return this.truckOwnerService.getCustomerInfo(targetId);
  }

  @ApiBearerAuth()
  @Get('admin/:id')
  async getAdminInfo(
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<LoginResponseDto> {
    return this.truckOwnerService.getAdminInfo(targetId);
  }

  @ApiBearerAuth()
  @Get(':id/my-jobs')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getMyJobs(
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[JobsResponseDto[], number]> {
    return this.truckOwnerService.getMyJobs(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @ApiBearerAuth()
  @Get(':id/get-past-jobs')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getPastJobs(
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[JobsResponseDto[], number]> {
    return this.truckOwnerService.getPastJobs(
      targetId,
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @ApiBearerAuth()
  @Post('/take-order/:id')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.TAKE_ORDER)
  async takeOrder(
    @Param('id') orderId: string,
    @Req() request: Request,
  ): Promise<boolean> {
    return this.truckOwnerService.takeOrder(
      orderId,
      (request as any).user.id,
      request,
    );
  }
  /* ------------------------------------------

   Driver

  ------------------------------------------ */

  @Get('drivers')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getDrivers(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<DriverDetailResponse> {
    return await this.truckOwnerService.getDrivers(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @Get('driver/:id')
  async getDriver(
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<DriverDetailResponse> {
    return await this.truckOwnerService.getDriver(
      (request as any).user.id,
      targetId,
    );
  }

  @Post('/add-driver')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.CREATE_DRIVER)
  async addDriver(
    @Req() request: Request,
    @Body() model: TruckOwnerCreateDriver,
  ): Promise<Driver> {
    return this.truckOwnerService.addDriver(model, (request as any).user.id);
  }

  @Put('driver/:id')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPDATE_DRIVER)
  async updateDriver(
    @Body() model: UpdateDriver,
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<DriverDetailResponse> {
    return this.truckOwnerService.updateDriver(
      model,
      (request as any).user.id,
      targetId,
    );
  }

  @Post(':id/upload-driver-card-front')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_DRIVER_CARD_FRONT)
  async updateDriverFrontCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadDriverFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_FRONT_IMAGE,
      (request as any).user.id,
    );
  }

  @Post(':id/upload-driver-card-back')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_DRIVER_CARD_BACK)
  async updateDriverBackCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadDriverFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_BACK_IMAGE,
      (request as any).user.id,
    );
  }

  @ApiBearerAuth()
  @Get('new-orders')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[Order[], number]> {
    return this.orderService.truckownerGetList(
      filterRequestDto,
      +(request as any).user.id,
    );
  }

  @Get('order/:id/trucks')
  async getOrderTrucks(
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<any[]> {
    return await this.orderService.getTrucksByOrder(targetId);
  }

  @Post('order/:id/trucks')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.ADD_TRUCK_TO_ORDER)
  async assignOrderTrucks(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() truckIds: number[],
    @Req() request: Request,
  ): Promise<any> {
    return await this.orderService.addTrucksToOrder(orderId, truckIds, request);
  }

  @Get('order/:id/drivers')
  async getOrderDrivers(
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<any[]> {
    return await this.orderService.getDriversByOrder(targetId);
  }

  @Post('order/:id/drivers')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.ADD_DRIVER_TO_ORDER)
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

  @ApiBearerAuth()
  @Post('orders-pending/export')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.EXPORT_ORDERS)
  async exportPendingOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByTruckOwnerDto[]> {
    const result = await this.truckOwnerService.exportOrders(
      (request as any).user.id,
      body,
      TYPE_TRUCKOWNER_ORDER.PENDING,
    );
    return result;
  }

  @ApiBearerAuth()
  @Post('orders/export')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.EXPORT_ORDERS)
  async exportOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByTruckOwnerDto[]> {
    const result = await this.truckOwnerService.exportOrders(
      (request as any).user.id,
      body,
      TYPE_TRUCKOWNER_ORDER.MYJOBS,
    );
    return result;
  }

  @ApiBearerAuth()
  @Post('orders-past/export')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.EXPORT_ORDERS)
  async exportPastOrders(
    @Req() request: Request,
    @Body() body: Record<string, any>,
  ): Promise<ExportOrdersByTruckOwnerDto[]> {
    const result = await this.truckOwnerService.exportOrders(
      (request as any).user.id,
      body,
      TYPE_TRUCKOWNER_ORDER.PASTJOBS,
    );
    return result;
  }

  @Put('payment-done/:id')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPDATE_PAYMENT_DONE)
  async updatePaymentDone(
    @Param('id', ParseIntPipe) orderId: number,
    @Body() model: PaymentDoneDto,
  ): Promise<boolean> {
    return await this.truckOwnerService.updatePaymentDone(orderId, model);
  }

  /**
   * REPORT
   */

  @ApiBearerAuth()
  @Get('orders/report')
  async getReport(
    @Req() request: Request,
    @Query() model: Record<string, any>,
  ): Promise<boolean> {
    return await this.truckOwnerService.getReport(
      (request as any).user.id,
      model,
    );
  }

  @ApiBearerAuth()
  @Get('orders/completed')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getCompletedOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return await this.truckOwnerService.getReportOrders(
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
    return await this.truckOwnerService.getReportOrders(
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
    return await this.truckOwnerService.getReportOrders(
      (request as any).user.id,
      filterRequestDto,
      TYPE_REPORT.CANCELLED,
    );
  }

  @ApiBearerAuth()
  @Get('orders/customer')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getReportCustomerOrders(
    @Req() request: Request,
    @Query() filterRequestDto: FilterRequestDto,
  ): Promise<[OrderResponseDto[], number]> {
    return await this.truckOwnerService.getReportCustomerOrders(
      (request as any).user.id,
      filterRequestDto,
    );
  }

  @Post(':lang')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  createAccount(
    @Body() createTruckOwnerModel: CreateUserDto,
    @Param('lang') lang: USER_LANGUAGE,
  ): Promise<boolean> {
    return this.truckOwnerService.registerAccount(createTruckOwnerModel, lang);
  }

  @Post(':id/upload-driver-doc')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Driver document upload',
    type: UploadFiles,
  })
  @UseInterceptors(FilesInterceptor('images[]', 3, multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_DRIVER_OTHER_DOC)
  async updateDriverOtherMultipleDoc(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadMultipleFile(
      files,
      targetId,
      REFERENCE_TYPE.OTHER_DRIVER_DOCUMENT,
      request,
    );
  }

  @Post(':id/upload-truck-doc')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Truck document upload',
    type: UploadFiles,
  })
  @UseInterceptors(FilesInterceptor('images[]', 3, multerOptions))
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.UPLOAD_TRUCK_OTHER_DOC)
  async uploadTruckOtherMultipleDoc(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('id', ParseIntPipe) targetId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.uploadMultipleFile(
      files,
      targetId,
      REFERENCE_TYPE.OTHER_TRUCK_DOCUMENT,
      request,
    );
  }

  @Delete('truck-files/other-doc/:id/:fileId/:type')
  async deleteTruckFileByFileId(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('fileId') fileId: string,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.deleteTruckFileByFileId(
      targetId,
      fileId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @Delete('driver-files/other-doc/:id/:fileId/:type')
  async deleteDriverFileByFileId(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('fileId') fileId: string,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.truckOwnerService.deleteDriverFileByFileId(
      targetId,
      fileId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @ApiBearerAuth()
  @Get('default-commission')
  async defaultCommission(): Promise<boolean> {
    return await this.truckOwnerService.getDefaultCommission();
  }

  @ApiBearerAuth()
  @Get('drivers-earning')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async getDriversEarning(
    @Query() model: GetDriverEarningRequestDto,
    @Req() request: Request,
  ): Promise<any> {
    return await this.truckOwnerService.getDriversEarning(
      model,
      (request as any).user.id,
    );
  }

  @ApiBearerAuth()
  @Post('driver/:id/payment')
  @SetMetadata(METADATA.ACTION, TRUCK_OWNER_ACTION.TRUCKOWNER_PAYMENT_DRIVER)
  async payDriverEarning(
    @Param('id', ParseIntPipe) id: number,
    @Body() model: PayDriverEarningRequestDto,
    @Req() request: Request,
  ): Promise<any> {
    return this.truckOwnerService.payDriverEarning(
      id,
      model,
      (request as any).user.id,
    );
  }
}

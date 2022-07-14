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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/dto/users/CreateUser.dto';
import { DriverService } from './driver.service';
import { ResetPassword } from '../../admin/user/dto/ResetPassword.dto';
import { UploadFile } from 'src/dto/file/UploadFile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/helpers/utility.helper';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { CheckToken } from 'src/dto/users/CheckToken.dto';
import { Request } from 'express';
import { UpdateDriver } from '../../admin/user/dto/UpdateDriver.dto';
import { DriverAuthenticationGuard } from 'src/common/guards/driverAuthentication.guard';
import { LoginUserDto } from 'src/dto/users/LoginUser.dto';
import { PhoneLoginDto } from 'src/dto/users/PhoneLogin.dto';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { LocationDto } from 'src/common/dtos/location.dto';
import {
  DRIVER_ACTION,
  DRIVER_MODULE,
} from 'src/common/constants/actions/driver/driver.action';
import { GetRequest } from '../../admin/user/dto/GetRequest.dto';
import { Order } from 'src/entities/order/order.entity';
import { DriverDetailResponse } from 'src/dto/driver/DriverDetail.dto';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';
import { OtpVerification } from 'src/dto/driver/OtpVerification.dto';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';

@ApiTags('Driver - User')
@Controller('driver')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(DriverAuthenticationGuard)
@SetMetadata(METADATA.MODULE, DRIVER_MODULE)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  @SetMetadata(METADATA.IS_PUBLIC, true)
  createDriver(@Body() createUserModel: CreateUserDto): Promise<boolean> {
    return this.driverService.registerDriver(createUserModel);
  }

  @Get('forgot-password')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async forgotPassword(@Query('email') email: string): Promise<boolean> {
    return this.driverService.forgotPassword(email);
  }

  @Post('otp-verification')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async otpVerification(@Body() model: OtpVerification): Promise<boolean> {
    return this.driverService.verifyOtp(model);
  }

  @Post('forgot-password-verification')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async verifyForgotpasswordOtp(@Body() model: OtpVerification): Promise<any> {
    return this.driverService.verifyForgotpasswordOtp(model);
  }

  @Get('resend-otp')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async resendOtp(@Query('phone') phone: string): Promise<boolean> {
    return this.driverService.resendOtp(phone);
  }

  @Post('reset-password')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async resetPassword(@Body() model: ResetPassword): Promise<boolean> {
    return this.driverService.resetPassword(model);
  }

  // Front card img
  @Post(':id/upload-card-front')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Id card front img upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.UPLOAD_CARD_FRONT)
  async updateFrontCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.driverService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_FRONT_IMAGE,
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
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.UPLOAD_CARD_BACK)
  async updateBackCardImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.driverService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_ID_CARD_BACK_IMAGE,
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
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.UPLOAD_CARD_BACK)
  async updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.driverService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_PROFILE_IMG,
    );
  }

  // License card
  @ApiBearerAuth()
  @Post(':id/upload-license-card')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Driver license upload',
    type: UploadFile,
  })
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.UPLOAD_DRIVER_LICENSE)
  async updateBusinessLicense(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return await this.driverService.uploadFile(
      file,
      targetId,
      REFERENCE_TYPE.DRIVER_LICENSE,
    );
  }

  @Delete('files/:id/:type')
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.DELETE_FILE)
  async deleteFile(
    @Param('id', ParseIntPipe) targetId: number,
    @Param('type', ParseIntPipe) type: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.driverService.deleteFile(
      targetId,
      type,
      (request as any).user.id,
      request,
    );
  }

  @ApiBearerAuth()
  @Post('check-token')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  async verifyToken(@Body() model: CheckToken): Promise<DriverDetailResponse> {
    const result = await this.driverService.verifyToken(model.token);
    return result;
  }

  @Post('login')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  login(@Body() model: LoginUserDto): Promise<DriverDetailResponse> {
    return this.driverService.login(model);
  }

  @Post('phone-login')
  @SetMetadata(METADATA.IS_PUBLIC, true)
  phoneLogin(@Body() model: PhoneLoginDto): Promise<DriverDetailResponse> {
    return this.driverService.phoneLogin(model);
  }

  @ApiBearerAuth()
  @Get('orders')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  async listOrders(
    @Req() request: Request,
    @Body() model: GetRequest,
  ): Promise<[Order[], number]> {
    return this.driverService.listOrders((request as any).user.id, model);
  }

  @ApiBearerAuth()
  @Post('orders/:orderId/tracking')
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.SEND_TRACKING)
  async createTracking(
    @Req() request: Request,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() model: LocationDto,
  ): Promise<boolean> {
    return this.driverService.createTracking(
      orderId,
      (request as any).user.id,
      model,
      request,
    );
  }

  @ApiBearerAuth()
  @Put(':id')
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.UPDATE_PROFILE)
  async updateProfile(
    @Body() model: UpdateDriver,
    @Req() request: Request,
    @Param('id', ParseIntPipe) targetId: number,
  ): Promise<boolean> {
    return this.driverService.updateProfile(
      model,
      targetId,
      (request as any).user.id,
    );
  }

  @ApiBearerAuth()
  @Put('orders/:id/cancel-order')
  @SetMetadata(METADATA.ACTION, DRIVER_ACTION.CANCEL_ORDER)
  async cancelOrderByCustomer(
    @Param('id', ParseIntPipe) orderId: number,
    @Req() request: Request,
  ): Promise<boolean> {
    return await this.driverService.cancelOrderByDriver(orderId, request);
  }

  @ApiBearerAuth()
  @Get('owner/:id')
  async getOwnerInfo(
    @Param('id', ParseIntPipe) ownerId: number,
    @Req() request: Request,
  ): Promise<TruckOwner> {
    return await this.driverService.getOwnerInfo(
      ownerId,
      (request as any).user.id,
    );
  }
}

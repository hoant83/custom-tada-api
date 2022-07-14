import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { CommonUserService } from './user.service';
import { USER_LANGUAGE } from 'src/common/constants/user-language.enum';
import { Request } from 'express';
import { CheckToken } from 'src/dto/users/CheckToken.dto';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { Settings } from 'src/entities/setting/setting.entity';

@ApiTags('Common User')
@Controller('user')
export class CommonUserController {
  constructor(private readonly userService: CommonUserService) {}

  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Get('verify-email/:token')
  verifyEmail(@Param('token') token: string): Promise<boolean> {
    return this.userService.verifyAccount(token);
  }

  @Put('lang/:language')
  async changePreferLang(
    @Param('language') language: USER_LANGUAGE,
    @Req() request: Request,
    @Body() model: CheckToken,
  ): Promise<any> {
    return await this.userService.changeLanguage(
      language,
      model.token,
      (request as any).user,
    );
  }

  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Get('settings')
  async getSettings(): Promise<AdminSetting[]> {
    return await this.userService.getSettings();
  }

  @Get('system-file')
  async getSystemfile(): Promise<any> {
    return await this.userService.getSystemImg();
  }

  @Get('setting/:type')
  async getSetting(
    @Param('type', ParseIntPipe) type: number,
  ): Promise<AdminSetting> {
    return await this.userService.getSetting(type);
  }

  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Get('test-black-box')
  testBlackBox(): Promise<any> {
    return this.userService.testingBlackBox();
  }

  @Get('license-settings')
  async getLicenseSettings(): Promise<Settings> {
    return await this.userService.getLicenseSettings();
  }
}

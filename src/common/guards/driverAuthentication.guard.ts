import { HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Driver } from 'src/entities/driver/driver.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TOKEN_TYPE } from '../constants/token-types.enum';
import { METADATA } from '../constants/metadata/metadata.constant';
import { customThrowError } from '../helpers/throw.helper';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from '../constants/response-messages.enum';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { SETTING_TYPE } from 'src/entities/admin-setting/enums/adminSettingType.enum';

@Injectable()
export class DriverAuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(AdminSetting)
    private readonly adminSettingRepository: Repository<AdminSetting>,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      METADATA.IS_PUBLIC,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }
    const request = this._getRequest(context);
    return this._handleRequest(request);
  }

  private async _handleRequest(req: Request): Promise<boolean> {
    const token = (req as any).user;

    if (!token || token.type !== TOKEN_TYPE.DRIVER_LOGIN) {
      return false;
    }

    const driver = await this.driverRepository.findOne(
      {
        passwordChangedAt: LessThanOrEqual(new Date(token.iat * 1000)),
        id: token.id,
      },
      {
        select: [
          'id',
          'email',
          'firstName',
          'session',
          'emailVerified',
          'syncCode',
        ],
      },
    );
    if (!driver) {
      return false;
    }

    const truckPool = await this.adminSettingRepository.findOne({
      settingType: SETTING_TYPE.TRUCK_POOL,
    });

    let truckPoolEnable = false;
    if (truckPool && truckPool.enabled) {
      truckPoolEnable = true;
    }

    if (!truckPoolEnable && driver.syncCode) {
      return false;
    }

    if (!driver.emailVerified) {
      customThrowError(
        RESPONSE_MESSAGES.PHONE_OTP_VERIFY,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.PHONE_OTP_VERIFY,
      );
    }

    if (driver.session !== token.session) {
      customThrowError(
        RESPONSE_MESSAGES.KICKED_OUT,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.KICKED_OUT,
      );
    }

    return true;
  }

  private _getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }
}

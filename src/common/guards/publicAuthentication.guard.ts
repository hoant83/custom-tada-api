import { Injectable, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { METADATA } from '../constants/metadata/metadata.constant';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { ApiKey } from 'src/entities/api-key/api-key.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PERMISSION } from 'src/entities/api-key/enums/permission.enum';
import { customThrowError } from '../helpers/throw.helper';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from '../constants/response-messages.enum';
import { Customer } from 'src/entities/customer/customer.entity';
import { TOKEN_TYPE } from 'src/common/constants/token-types.enum';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';

@Injectable()
export class PublicAuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
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
    return this._handleRequest(request, context);
  }

  private async _handleRequest(
    req: Request,
    context: ExecutionContext,
  ): Promise<boolean> {
    const { apiKey } = req.body;
    if (!apiKey) {
      return false;
    }

    const publicApiSalt = this.configService.get('PUBLIC_API_SALT');
    if (!publicApiSalt) {
      return false;
    }

    const bytes = CryptoJS.AES.decrypt(apiKey, publicApiSalt);
    const apiCode = bytes.toString(CryptoJS.enc.Utf8);
    if (!apiCode) {
      return false;
    }

    const api = await this.apiKeyRepository.findOne({ code: apiCode });
    if (!api) {
      return false;
    }
    let requirePermissions = this.reflector.get<PERMISSION[]>(
      METADATA.PUBLIC_API_ACTION,
      context.getHandler(),
    );

    if (requirePermissions) {
      if (!Array.isArray(requirePermissions)) {
        requirePermissions = [requirePermissions];
      }
      const checkPermission = requirePermissions.every(
        (permission: PERMISSION) =>
          api.permission && api.permission.includes(permission),
      );
      if (!checkPermission) {
        customThrowError(
          RESPONSE_MESSAGES.UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
          RESPONSE_MESSAGES_CODE.UNAUTHORIZED,
        );
      }
    }

    const user = await this.customerRepository.findOne({ id: api.customerId });
    if (!user) {
      return false;
    }
    (req as any).user = {
      id: user.id,
      email: user.email,
      type: TOKEN_TYPE.CUSTOMER_LOGIN,
      role: TOKEN_ROLE.CUSTOMER,
    };
    return true;
  }

  private _getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }
}

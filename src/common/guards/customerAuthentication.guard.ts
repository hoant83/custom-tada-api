import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AdminRepository } from 'src/repositories/admin.repository';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { LessThanOrEqual } from 'typeorm';
import { METADATA } from '../constants/metadata/metadata.constant';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from '../constants/response-messages.enum';
import { TOKEN_TYPE } from '../constants/token-types.enum';
import { customThrowError } from '../helpers/throw.helper';

@Injectable()
export class CustomerAuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly customerRepository: CustomerRepository,
    private readonly adminRepository: AdminRepository,
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

    if (
      !token ||
      (token.type !== TOKEN_TYPE.CUSTOMER_LOGIN &&
        token.type !== TOKEN_TYPE.ADMIN_LOGIN)
    ) {
      return false;
    }

    const repo =
      token.type === TOKEN_TYPE.ADMIN_LOGIN
        ? this.adminRepository
        : this.customerRepository;

    const user = await (repo as any).findOne(
      {
        email: token.email,
        passwordChangedAt: LessThanOrEqual(new Date(token.iat * 1000)),
      },
      { select: ['id', 'email', 'firstName', 'session', 'emailVerified'] },
    );

    if (!user) {
      return false;
    }

    if (!user.emailVerified) {
      customThrowError(
        RESPONSE_MESSAGES.EMAIL_NOT_VERIFY,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.EMAIL_NOT_VERIFY,
      );
    }

    // requirement by Peter only driver needs session

    // if (user.session !== token.session) {
    //   customThrowError(
    //     RESPONSE_MESSAGES.KICKED_OUT,
    //     HttpStatus.UNAUTHORIZED,
    //     RESPONSE_MESSAGES_CODE.KICKED_OUT,
    //   );
    // }
    return true;
  }

  private _getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }
}

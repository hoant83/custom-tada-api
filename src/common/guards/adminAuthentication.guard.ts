import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Admin } from 'src/entities/admin/admin.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { METADATA } from '../constants/metadata/metadata.constant';

@Injectable()
export class AdminAuthenticationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
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

    if (!token) {
      return false;
    }

    const admin = await this.adminRepository.findOne(
      {
        email: token.email,
        passwordChangedAt: LessThanOrEqual(new Date(token.iat * 1000)),
      },
      { select: ['id', 'email', 'firstName', 'session'] },
    );

    if (!admin) {
      return false;
    }

    // if (admin.session !== token.session) {
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

import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { METADATA } from '../constants/metadata/metadata.constant';

@Injectable()
export class CommonAuthenticationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
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
    return true;
  }

  private _getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToHttp().getRequest();
  }
}

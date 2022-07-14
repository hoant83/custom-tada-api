import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { METADATA } from '../constants/metadata/metadata.constant';
import { AuditLogService } from '../modules/audit-logs/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const action = this.reflector.get<string>(
          METADATA.ACTION,
          context.getHandler(),
        );

        const module = this.reflector.get<string>(
          METADATA.MODULE,
          context.getClass(),
        );

        if (action) {
          const request = context.switchToHttp().getRequest();
          this.auditLogService.writeLog({ module, action, request });
        }
        return data;
      }),
    );
  }
}

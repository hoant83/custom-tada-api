import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from 'src/entities/audit-log/audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { Admin } from 'src/entities/admin/admin.entity';
import { AuditLogRepository } from './audit-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Admin, AuditLogRepository])],
  controllers: [AuditLogController],
  providers: [AuditLogService],
})
export class AuditLogModule {}

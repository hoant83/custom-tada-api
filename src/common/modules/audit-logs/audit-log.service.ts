import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from 'src/entities/audit-log/audit-log.entity';
import { FindManyOptions, Raw, Repository } from 'typeorm';
import { FilterLogRequestDto } from './dto/filter-log-request.dto';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogResponseDto } from './dto/AuditLogResponse.dto';
import { WriteAuditLog } from './dto/WriteAuditLog.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly logRepository: Repository<AuditLog>,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async writeLog(model: WriteAuditLog): Promise<number> {
    const { module, action, request } = model;
    const log = new AuditLog();

    log.userId = request.user ? request.user.id : null;
    log.email = request.user ? request.user.email : null;
    log.role = request.user ? request.user.role : null;
    log.phoneNumber = request.user ? request.user.phoneNumber : '';

    log.action = action;
    log.module = module;
    log.url = request.originalUrl;

    const clone = request.customBody
      ? { ...request.customBody }
      : request.body
      ? { ...request.body }
      : '';

    for (const key in clone) {
      if (!clone[key]) {
        delete clone[key];
      }
    }

    log.content = clone;
    log.key = request.customKey ?? '';

    const result = await this.auditLogRepository.save(log);

    return result.id;
  }

  async getList(filterOptionsModel: FilterLogRequestDto): Promise<any> {
    const { skip, take, search, userId } = filterOptionsModel;
    const order = {};
    let where = [];

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).createdDate = 'DESC';
    }

    if (search) {
      const rawWhere = Raw(
        alias => `LOWER(${alias}) like '%${search.toLowerCase()}%'`,
      );

      where = [{ module: rawWhere }, { action: rawWhere }];
    }

    if (userId) {
      where = where.map(condition => ({ ...condition, userId }));
    }

    const options: FindManyOptions<AuditLog> = {
      where,
      skip,
      take,
      order,
    };
    return await this.logRepository.findAndCount(options);
  }

  async getAuditLogs(
    filterOptionsModel: FilterLogRequestDto,
  ): Promise<[AuditLogResponseDto[], number]> {
    return await this.auditLogRepository.getAuditLogs(filterOptionsModel);
  }
}

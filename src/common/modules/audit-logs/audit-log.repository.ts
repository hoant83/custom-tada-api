import { AuditLog } from 'src/entities/audit-log/audit-log.entity';
import { Brackets, EntityRepository, IsNull, Not, Repository } from 'typeorm';
import { AuditLogResponseDto } from './dto/AuditLogResponse.dto';
import { FilterLogRequestDto } from './dto/filter-log-request.dto';

@EntityRepository(AuditLog)
export class AuditLogRepository extends Repository<AuditLog> {
  async getAuditLogs(
    filterOptionsModel: FilterLogRequestDto,
  ): Promise<[AuditLogResponseDto[], number]> {
    const {
      skip,
      take,
      action,
      module,
      email,
      role,
      after,
      before,
      key,
    } = filterOptionsModel;

    const query = this.createQueryBuilder('a').where({ id: Not(IsNull()) });

    if (action) {
      query.andWhere("replace(lower(a.action), '_', ' ') like :action", {
        action: `%${action.toLowerCase()}%`,
      });
    }

    if (module) {
      query.andWhere("replace(lower(a.module), '_', ' ') like :module", {
        module: `%${module.toLowerCase()}%`,
      });
    }

    if (email) {
      query.andWhere(
        new Brackets(qb => {
          qb.where('lower(a.email) like :email', {
            email: `%${email.toLowerCase()}%`,
          }).orWhere('a."phoneNumber" like :phoneNumber', {
            phoneNumber: `%${email.toLowerCase()}%`,
          });
        }),
      );
    }

    if (role) {
      query.andWhere(`a.role = :role`, {
        role,
      });
    }

    if (key) {
      query.andWhere(`lower(a.key) like :key`, {
        key: `%${key.toLowerCase()}%`,
      });
    }

    if (after) {
      query.andWhere('a.createdDate >= :after', {
        after,
      });
    }

    query.andWhere('a.createdDate <= :before', {
      before: before ? before : new Date(),
    });

    const [result, count] = await query
      .skip(skip)
      .take(take)
      .orderBy('a.id', 'DESC')
      .select()
      .getManyAndCount();

    const newResult = result.map(r => new AuditLogResponseDto(r));
    return [newResult, count];
  }
}

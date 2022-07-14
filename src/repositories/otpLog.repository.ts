import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(OtpLog)
export class OtpLogRepository extends Repository<OtpLog> {}

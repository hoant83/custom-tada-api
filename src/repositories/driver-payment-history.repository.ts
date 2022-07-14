import { DriverPaymentHistory } from 'src/entities/driver-payment-history/driver-payment-history.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(DriverPaymentHistory)
export class DriverPaymentHistoryRepository extends Repository<
  DriverPaymentHistory
> {}

import { Pricing } from 'src/entities/pricing/pricing.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Pricing)
export class PricingRepository extends Repository<Pricing> {}

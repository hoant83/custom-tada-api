import { Address } from 'src/entities/address/address.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {}

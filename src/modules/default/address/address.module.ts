import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from 'src/entities/province/province.entity';
import { AddressRepository } from 'src/repositories/address.repository';
import { CustomerRepository } from '../../../repositories/customer.repository';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AddressRepository, CustomerRepository, Province]),
  ],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceQuotation } from 'src/entities/price-quotation/price-quotation.entity';
import { PriceQuotationController } from './price-quotation.controller';
import { PriceQuotationService } from './price-quotation.service';
import { Admin } from 'src/entities/admin/admin.entity';
import { Customer } from 'src/entities/customer/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceQuotation, Admin, Customer])],
  controllers: [PriceQuotationController],
  providers: [PriceQuotationService],
})
export class PriceQuotationModule {}

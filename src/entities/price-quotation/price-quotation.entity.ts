import {
  Column,
  Entity,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { PRICE_QUOTATION_STATUS } from './priceQuotationStatus.enum';
import { Admin } from '../admin/admin.entity';

@Entity()
export class PriceQuotation extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(() => Customer)
  @JoinTable()
  customers: Customer[];

  @ManyToOne(
    () => Admin,
    admin => admin.priceQuotations,
  )
  @JoinColumn({ name: 'lastUpdatedBy' })
  admin: Admin;

  @Column()
  lastUpdatedBy: number;

  @Column()
  lastUpdatedTime: Date;

  @Column({
    type: 'enum',
    enum: PRICE_QUOTATION_STATUS,
    default: PRICE_QUOTATION_STATUS.DRAFT,
  })
  status: PRICE_QUOTATION_STATUS;

  @Column({ nullable: true, type: 'json' })
  quotation: any;

  @Column({ nullable: true })
  note: string;

  @Column({ default: true })
  toAllCustomers: boolean;

  @Column({ nullable: true, default: 'VND' })
  currency: string;
}

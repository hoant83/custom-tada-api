import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { PAYMENT_TYPE } from './enums/payment.enum';

@Entity()
export class DefaultPayment extends BaseEntity {
  @Column({ default: false })
  needVATInvoice: boolean;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  bussinessLicenseNO: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'enum', nullable: true, enum: PAYMENT_TYPE })
  paymentType: PAYMENT_TYPE;

  @Column({ nullable: true })
  otherPayment: string;

  @OneToOne(
    () => Customer,
    customer => customer.payment,
  )
  customer: Customer;

  @Column({ nullable: true })
  customerId: number;
}

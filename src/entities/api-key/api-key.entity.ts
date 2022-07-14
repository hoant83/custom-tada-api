import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PERMISSION } from './enums/permission.enum';
import { Customer } from '../customer/customer.entity';

@Entity()
export class ApiKey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @ManyToOne(
    () => Customer,
    customer => customer.apiKeys,
  )
  customer: Customer;

  @Column()
  customerId: number;

  @Column({
    type: 'enum',
    enum: PERMISSION,
    array: true,
    nullable: true,
  })
  permission: PERMISSION[];

  @Column({ default: false })
  isActive: boolean;
}

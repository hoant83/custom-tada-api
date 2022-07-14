import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Customer } from '../customer/customer.entity';
import { TruckOwner } from '../truckOwner/truckOwner.entity';
import { IsOptional } from 'class-validator';

@Entity()
export class Company extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @IsOptional()
  phone?: string;

  @Column()
  @IsOptional()
  address?: string;

  @Column()
  @IsOptional()
  licenseNo?: string;

  @OneToMany(
    () => Customer,
    customer => customer.company,
  )
  customers: Customer[];

  @OneToOne(
    () => TruckOwner,
    truckOwner => truckOwner.company,
  )
  truckOwner: TruckOwner;

  @Column({ unique: true, nullable: true })
  syncCode: string;

  @Column({ nullable: true })
  syncDate: Date;

  @Column({ default: false })
  shouldSync: boolean;
}

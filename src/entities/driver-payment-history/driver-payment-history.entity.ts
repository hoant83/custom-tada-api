import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Driver } from '../driver/driver.entity';

@Entity()
export class DriverPaymentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @ManyToOne(
    () => Driver,
    driver => driver.paymentHistory,
  )
  driver: Driver;

  @Column()
  note?: string;

  @Column()
  amount: number;

  @Column()
  date: Date;

  @Column({ default: false })
  isCash: boolean;

  @Column({ default: false })
  isTransfer: boolean;

  @Column({ default: false })
  isOthers: boolean;

  @Column({ nullable: true })
  othersNote?: string;
}

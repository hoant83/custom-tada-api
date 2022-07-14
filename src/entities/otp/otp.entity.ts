import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
  JoinColumn,
  OneToOne,
  Entity,
} from 'typeorm';
import { Driver } from '../driver/driver.entity';
import { TruckOwner } from '../truckOwner/truckOwner.entity';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @OneToOne(
    () => Driver,
    driver => driver.otpCode,
  )
  @JoinColumn()
  user: Driver;

  @OneToOne(
    () => TruckOwner,
    truckOwner => truckOwner.otpCode,
  )
  @JoinColumn()
  truckOwner: TruckOwner;

  @Column({ nullable: true })
  code: number;
}

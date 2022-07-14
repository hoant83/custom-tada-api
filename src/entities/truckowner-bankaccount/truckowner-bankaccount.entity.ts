import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from '@anpham1925/nestjs';
import { TruckOwner } from '../truckOwner/truckOwner.entity';

@Entity()
export class TruckOwnerBankAccount extends CommonEntity {
  @OneToOne(
    () => TruckOwner,
    truckOwner => truckOwner.id,
  )
  @JoinColumn()
  truckOwner: TruckOwner;

  @Column({
    unique: true,
    nullable: false,
  })
  truckOwnerId: number;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  businessLicenseNo: number;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankBranch: string;

  @Column({ nullable: true })
  bankAccountHolderName: string;

  @Column({ nullable: true })
  bankAccountNumber: string;
}

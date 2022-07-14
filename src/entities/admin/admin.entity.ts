import { Entity, Column, DeleteDateColumn, OneToMany } from 'typeorm';
import { USER_TYPE } from './enums/userType.enum';
import { LICENSE } from './enums/userLicense.enum';
import { UserCommonEntity } from '../userCommon.entity';
import { PriceQuotation } from '../price-quotation/price-quotation.entity';

@Entity()
export class Admin extends UserCommonEntity {
  @Column({
    nullable: true,
    length: 60,
  })
  cardNo: string;

  @Column({
    type: 'enum',
    enum: USER_TYPE,
    default: USER_TYPE.ADMIN,
  })
  userType: USER_TYPE;

  @Column({
    type: 'enum',
    enum: LICENSE,
    default: LICENSE.STANDARD,
  })
  userLicense: LICENSE;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(
    () => PriceQuotation,
    priceQuotation => priceQuotation.admin,
  )
  priceQuotations: PriceQuotation[];
}

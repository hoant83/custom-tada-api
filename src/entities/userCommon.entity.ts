import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { IsEmail } from 'class-validator';
import { USER_STATUS } from './enums/userStatus.enum';
import { VERIFIED_STATUS } from './enums/verifiedStatus.enum';
import { USER_LANGUAGE } from '../common/constants/user-language.enum';

export abstract class UserCommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @Column({
    unique: true,
    nullable: true,
  })
  @IsEmail()
  email: string;

  @Column({
    nullable: true,
    length: 12,
  })
  phoneNumber: string;

  @Column({
    nullable: true,
    length: 60,
    select: false,
  })
  password: string;

  @Column({
    nullable: true,
    length: 60,
  })
  session: string;

  @Column({
    default: new Date(),
  })
  passwordChangedAt: Date;

  @Column({
    nullable: true,
  })
  firstName: string;

  @Column({
    nullable: true,
  })
  lastName: string;

  @Column({
    type: 'enum',
    enum: VERIFIED_STATUS,
    default: VERIFIED_STATUS.UNVERIFIED,
  })
  verifiedStatus: VERIFIED_STATUS;

  @Column({
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.INACTIVE,
  })
  status: USER_STATUS;

  @Column({
    nullable: true,
  })
  notiToken: string;

  @Column({
    nullable: true,
  })
  deviceToken: string;

  @Column({
    default: false,
  })
  emailVerified: boolean;

  @Column({
    enum: USER_LANGUAGE,
    default: USER_LANGUAGE.VI,
  })
  preferLanguage: USER_LANGUAGE;

  @Column({
    default: false,
  })
  notShowAgain: boolean;
}

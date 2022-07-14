import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class OtpLog {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @Column()
  phoneNumber: string;

  @Column()
  log: string;

  @Column({ nullable: true })
  twilioMessageId: string;

  @Column({ nullable: true })
  twilioStatus: string;
}

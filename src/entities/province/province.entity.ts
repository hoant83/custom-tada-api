import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { COUNTRY } from './enums/country.enum';

@Entity()
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  nameWithType: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: COUNTRY.VIETNAM })
  countryCode: string;

  @Column({ nullable: true })
  alias: string;

  @Column({
    default: 0,
  })
  index: number;
}

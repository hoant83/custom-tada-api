import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { REFERENCE_TYPE } from './enums/referenceType.enum';
import { Min } from 'class-validator';
import { Folder } from '../folder/folder.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn()
  updatedDate: Date;

  @CreateDateColumn()
  createdDate: Date;

  @Column({
    enum: REFERENCE_TYPE,
    nullable: true,
  })
  referenceType: REFERENCE_TYPE;

  @Column({
    nullable: true,
    default: 0,
  })
  @Min(0)
  referenceId: number;

  @Column({
    nullable: true,
  })
  extension: string;

  @Column({
    nullable: true,
  })
  fileName: string;

  @ManyToOne(
    () => Folder,
    folder => folder.files,
  )
  folder: Folder;

  @Column({ nullable: true })
  folderId: number;
}

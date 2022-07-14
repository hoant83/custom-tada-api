import { customThrowError } from '@anpham1925/nestjs';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUpdateImportantNote } from 'src/dto/requests/important-notes/create-update.dto';
import { ToggleImportantNote } from 'src/dto/requests/important-notes/toggle.dto';
import { Customer } from 'src/entities/customer/customer.entity';
import { IMPORTANT_NOTE_ROLE } from 'src/entities/important-notes/enums/important-note-role.enum';
import { ImportantNote } from 'src/entities/important-notes/important-notes.entity';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { ImportantNoteRepository } from 'src/repositories/important-note.repository';
import { Connection, UpdateResult } from 'typeorm';

@Injectable()
export class AdminImportantNoteService implements OnModuleInit {
  constructor(
    private readonly importantNoteRepository: ImportantNoteRepository,
    private readonly connection: Connection,
  ) {}

  async onModuleInit() {
    await this.init();
    console.log('finish init important note');
  }

  /**
   *
   * @param id id of the updated ImportantNote
   * @param param1 {content, isOn} value of ImportantNote
   * @returns
   */

  async update(
    id: number,
    { content, isOn }: CreateUpdateImportantNote,
  ): Promise<boolean> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let needUpdateUserFlag = false;

    try {
      const note = await queryRunner.manager.findOne(ImportantNote, {
        where: { id },
      });

      if (!note) {
        customThrowError('Note not found!', HttpStatus.NOT_FOUND);
      }

      if (note.content !== content) {
        note.content = content;
        needUpdateUserFlag = true;
      }

      note.isOn = isOn;

      let secondPromise = null;

      if (needUpdateUserFlag) {
        if (note.type === IMPORTANT_NOTE_ROLE.CUSTOMER) {
          secondPromise = queryRunner.manager.update(
            Customer,
            { notShowAgain: true },
            { notShowAgain: false },
          );
        }
        if (note.type === IMPORTANT_NOTE_ROLE.TRUCK_OWNER) {
          queryRunner.manager.update(
            TruckOwner,
            { notShowAgain: true },
            { notShowAgain: false },
          );
        }
      }

      const promises: [Promise<ImportantNote>, Promise<UpdateResult>] = [
        queryRunner.manager.save(note),
        secondPromise,
      ];

      await Promise.all(promises);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async toggle(id: number, { isOn }: ToggleImportantNote): Promise<boolean> {
    await this.importantNoteRepository.update(id, { isOn });
    return true;
  }

  async list(): Promise<ImportantNote[]> {
    return this.importantNoteRepository.find();
  }

  async init(): Promise<boolean> {
    const notes = await this.importantNoteRepository.find();
    const notesToInit: ImportantNote[] = [];

    if (!notes.find(x => x.type === IMPORTANT_NOTE_ROLE.CUSTOMER)) {
      notesToInit.push(
        this.importantNoteRepository.create({
          type: IMPORTANT_NOTE_ROLE.CUSTOMER,
          content: 'note for customer',
        }),
      );
    }

    if (!notes.find(x => x.type === IMPORTANT_NOTE_ROLE.TRUCK_OWNER)) {
      notesToInit.push(
        this.importantNoteRepository.create({
          type: IMPORTANT_NOTE_ROLE.TRUCK_OWNER,
          content: 'note for truckowner',
        }),
      );
    }
    await this.importantNoteRepository.save(notesToInit);
    return true;
  }
}

import { Injectable } from '@nestjs/common';
import { TOKEN_ROLE } from 'src/common/constants/token-role.enum';
import { IMPORTANT_NOTE_ROLE } from 'src/entities/important-notes/enums/important-note-role.enum';
import { ImportantNote } from 'src/entities/important-notes/important-notes.entity';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { ImportantNoteRepository } from 'src/repositories/important-note.repository';
import { AdminRepository } from 'src/repositories/admin.repository';

@Injectable()
export class ImportantNoteService {
  constructor(
    private readonly importantNoteRepository: ImportantNoteRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly truckOwnerRepository: TruckOwnerRepository,
    private readonly adminRepository: AdminRepository,
  ) {}

  private async _customerTurnOffImportantNote(
    userId: number,
  ): Promise<boolean> {
    await this.customerRepository.update(
      { id: userId },
      { notShowAgain: true },
    );
    return true;
  }

  private async _truckOwnerTurnOffImportantNote(
    userId: number,
  ): Promise<boolean> {
    await this.truckOwnerRepository.update(
      { id: userId },
      { notShowAgain: true },
    );
    return true;
  }

  private async _adminTurnOffImportantNote(userId: number): Promise<boolean> {
    await this.adminRepository.update({ id: userId }, { notShowAgain: true });
    return true;
  }

  async turnOffImportantNote(user: Record<string, any>): Promise<boolean> {
    if (!user) {
      return false;
    }
    if (user.role === TOKEN_ROLE.CUSTOMER) {
      return this._customerTurnOffImportantNote(user.id);
    }

    if (user.role === TOKEN_ROLE.TRUCK_OWNER) {
      return this._truckOwnerTurnOffImportantNote(user.id);
    }

    if (user.role === TOKEN_ROLE.ADMIN) {
      return this._adminTurnOffImportantNote(user.id);
    }

    return false;
  }

  async retrieveImportantNote(
    user: Record<string, any>,
  ): Promise<ImportantNote> {
    if (!user) {
      return null;
    }
    if (user.role === TOKEN_ROLE.CUSTOMER) {
      return this.importantNoteRepository.findOne({
        where: { isOn: true, type: IMPORTANT_NOTE_ROLE.CUSTOMER },
      });
    }

    if (user.role === TOKEN_ROLE.TRUCK_OWNER) {
      return this.importantNoteRepository.findOne({
        where: { isOn: true, type: IMPORTANT_NOTE_ROLE.TRUCK_OWNER },
      });
    }
  }
}

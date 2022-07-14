import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repositories/customer.repository';
import { TruckOwnerRepository } from 'src/repositories/truckOwner.repository';
import { ImportantNoteRepository } from 'src/repositories/important-note.repository';
import { ImportantNoteController } from './important-note.controller';
import { ImportantNoteService } from './important-note.service';
import { AdminRepository } from 'src/repositories/admin.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportantNoteRepository,
      CustomerRepository,
      TruckOwnerRepository,
      AdminRepository,
    ]),
  ],
  controllers: [ImportantNoteController],
  providers: [ImportantNoteService],
})
export class ImportantNoteModule {}

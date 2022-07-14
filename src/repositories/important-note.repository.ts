import { ImportantNote } from 'src/entities/important-notes/important-notes.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ImportantNote)
export class ImportantNoteRepository extends Repository<ImportantNote> {}

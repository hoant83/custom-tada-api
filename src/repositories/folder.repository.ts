import { EntityRepository, Repository } from 'typeorm';
import { Folder } from 'src/entities/folder/folder.entity';
import { FoldersResponseDto } from 'src/dto/folders/FoldersResponse.dto';
import { File } from 'src/entities/file/file.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';

@EntityRepository(Folder)
export class FolderRepository extends Repository<Folder> {
  async getListDocuments(findOptions: {
    folderId: number;
  }): Promise<FoldersResponseDto> {
    const a = REFERENCE_TYPE.ORDER_DOCUMENT;
    const document = await this.createQueryBuilder('folder')
      .where('folder.id = :folderId', { ...findOptions })
      .leftJoinAndMapMany(
        'folder.files',
        File,
        'documents',
        'documents.referenceType = :a and documents.folderId = folder.id',
        { a },
      )
      .select()
      .getOne();
    return new FoldersResponseDto(document);
  }
}

import { Folder } from 'src/entities/folder/folder.entity';
import { Exclude, Expose } from 'class-transformer';
import { File } from 'src/entities/file/file.entity';

export class FoldersResponseDto extends Folder {
  @Exclude()
  files: File[];

  @Expose({
    name: 'metadata',
  })
  get metadata(): any[] {
    if (this.files) {
      return this.files.map(d => ({
        id: d.id,
        link: `${process.env.BACKEND_HOST}/api/assets/${d.id}.${d.extension}`,
        fileName: d.fileName,
      }));
    }
    return [];
  }

  constructor(partial: Partial<Folder> = {}) {
    super();
    Object.assign(this, partial);
  }
}

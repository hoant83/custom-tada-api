import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { RESOLVE_PATH } from 'src/common/constants/resolve-path.enum';

@Injectable()
export class FileHelper {
  public writeFile(destination: string, file: Express.Multer.File): void {
    try {
      const folderPath = this.getDestinationFolder();
      const filePath = path.join(folderPath, `${destination}`);

      if (!existsSync(folderPath)) {
        mkdirSync(folderPath);
      }
      writeFileSync(filePath, file.buffer);
    } catch (error) {}
  }

  private getDestinationFolder(): string {
    let locationFolder = '';
    locationFolder = path.resolve(RESOLVE_PATH.IMAGE);
    return locationFolder;
  }
}

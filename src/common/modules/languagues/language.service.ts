import { HttpStatus, Injectable } from '@nestjs/common';
import fs = require('fs');
import path = require('path');
import { customThrowError } from 'src/common/helpers/throw.helper';

@Injectable()
export class LanguageService {
  getResource(lang: string): string {
    const pathDir = path.join(__dirname, '../../../locales');
    if (!fs.existsSync(`${pathDir}/${lang}.json`)) {
      customThrowError('Resource not found!', HttpStatus.NOT_FOUND);
    }

    return JSON.parse(fs.readFileSync(`${pathDir}/${lang}.json`).toString());
  }
}

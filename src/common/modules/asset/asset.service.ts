import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AssetService {
  async retrieve(name: string, res: Response) {
    return res.sendFile(name, { root: './uploads' });
  }
}

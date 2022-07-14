import { ApiProperty } from '@nestjs/swagger';

export class UploadFile {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;
}

export class Csv {
  @ApiProperty({ type: 'string', format: 'binary' })
  csv: any;
}

export class UploadFiles {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  images: UploadFile[];
}

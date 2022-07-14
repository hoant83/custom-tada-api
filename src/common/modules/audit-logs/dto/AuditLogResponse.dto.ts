import { Exclude } from 'class-transformer';

export class AuditLogResponseDto {
  id: number;
  action: string;
  module: string;
  content: any;
  createdDate: Date;

  @Exclude()
  userId: number;

  constructor(partial: Partial<AuditLogResponseDto>) {
    Object.assign(this, partial);
  }
}

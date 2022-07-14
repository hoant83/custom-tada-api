import { IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ACCOUNT_ROLE } from 'src/entities/customer/enums/accountRole.enum';
import { Transform } from 'class-transformer';

export class CreateUserByAdminDto {
  @IsEmail()
  @ApiProperty()
  @Transform(it => it.toLowerCase())
  email: string;

  @IsOptional()
  @ApiPropertyOptional()
  firstName?: string;

  @IsOptional()
  @ApiPropertyOptional()
  lastName?: string;

  @IsOptional()
  @ApiPropertyOptional()
  phoneNumber?: string;

  @IsOptional()
  @ApiPropertyOptional()
  accountRole?: ACCOUNT_ROLE;
}

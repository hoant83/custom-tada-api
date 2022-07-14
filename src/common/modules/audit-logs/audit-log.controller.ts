import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FilterLogRequestDto } from './dto/filter-log-request.dto';
import { AdminAuthenticationGuard } from 'src/common/guards/adminAuthentication.guard';
import { METADATA } from 'src/common/constants/metadata/metadata.constant';
import { AuditLogResponseDto } from './dto/AuditLogResponse.dto';
import { RESPONSE_EXPLAINATION } from 'src/common/constants/response-messages.enum';

@ApiTags('AuditLog')
@Controller('audit-log')
@UseGuards(AdminAuthenticationGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @SetMetadata(METADATA.IS_PUBLIC, true)
  @Get('get-list')
  @ApiOkResponse({ description: RESPONSE_EXPLAINATION.LIST })
  getList(
    @Query() FilterOptionsModel: FilterLogRequestDto,
  ): Promise<[AuditLogResponseDto[], number]> {
    return this.auditLogService.getAuditLogs(FilterOptionsModel);
  }
}

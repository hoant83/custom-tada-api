import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import { LanguageModule } from './common/modules/languagues/language.module';
import { LogModule } from './common/modules/custom-logs/log.module';
import { LogService } from './common/modules/custom-logs/log.service';
import { AllExceptionsFilter } from './common/filters/exception.filter';
import { FormatResponseInterceptor } from './common/interceptors/response.interceptor';
import { AuditLogModule } from './common/modules/audit-logs/audit-log.module';
import { AuditLogService } from './common/modules/audit-logs/audit-log.service';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { CustomerModule } from './modules/default/customer/customer.module';
import { AdminUserModule } from './modules/admin/user/admin.module';
import { TruckOwnerModule } from './modules/default/truckOwner/truckOwner.module';
import { DriverModule } from './modules/default/driver/driver.module';
import { OrderModule } from './modules/default/order/order.module';
import { ProvinceModule } from './modules/default/province/province.module';
import { AdminNotificationModule } from './modules/admin/notification/notification.module';
import { NotificationModule } from './common/modules/notification/notification.module';
import { CommonUserModule } from './common/modules/user/user.module';
import { SmsModule } from './common/modules/sms/sms.module';
import { AdminImportantNoteModule } from './modules/admin/important-notes/important-note.module';
import { ImportantNoteModule } from './modules/default/important-notes/important-note.module';
import { BlackBoxModule } from './modules/default/black-box/black-box.module';
import { PriceQuotationModule } from './modules/default/price-quotation/price-quotation.module';
import { SyncModule } from './modules/default/sync/sync.module';
import { PublicModule } from './modules/default/public/public.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpAdapter();

  server.get('/ping', (req, res) => {
    return res.sendStatus(200);
  });

  app.setGlobalPrefix('api');
  app.use(helmet());

  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  const options = new DocumentBuilder()
    .setTitle('Tada-Truck APIs')
    .setDescription('Detail of Tada-Truck APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    include: [
      LanguageModule,
      CustomerModule,
      AdminUserModule,
      TruckOwnerModule,
      DriverModule,
      OrderModule,
      ProvinceModule,
      AdminNotificationModule,
      NotificationModule,
      CommonUserModule,
      AuditLogModule,
      LogModule,
      SmsModule,
      AdminImportantNoteModule,
      ImportantNoteModule,
      BlackBoxModule,
      PriceQuotationModule,
      SyncModule,
      PublicModule,
    ],
  });
  SwaggerModule.setup('api/swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
      skipNullProperties: true,
      skipUndefinedProperties: true,
      skipMissingProperties: true,
      transform: true,
    }),
  );

  app.use('/images', express.static(join(__dirname, 'images')));
  app.use('/audios', express.static(join(__dirname, 'audios')));
  app.use('/pdf', express.static(join(__dirname, 'pdf')));
  app.use('/asset', express.static(join(__dirname, 'asset')));
  const logService = app.select(LogModule).get(LogService);
  const auditLogService = app.select(AuditLogModule).get(AuditLogService);

  const reflector = new Reflector();

  app.useGlobalFilters(new AllExceptionsFilter(logService));

  app.useGlobalInterceptors(
    new FormatResponseInterceptor(),
    new AuditLogInterceptor(reflector, auditLogService),
  );

  await app.listen(port, '0.0.0.0');

  console.log(`api app is working on port: ${port}`);
}

bootstrap();

import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SyncSetting } from 'src/entities/sync-setting/sync-setting.entity';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { createConnections, getConnection, Brackets } from 'typeorm';
import { TruckOwner } from 'src/entities/truckOwner/truckOwner.entity';
import { Company } from 'src/entities/company/company.entity';
import { Driver } from 'src/entities/driver/driver.entity';
import { Order } from 'src/entities/order/order.entity';
import { Customer } from 'src/entities/customer/customer.entity';
import { Admin } from 'src/entities/admin/admin.entity';
import { PriceQuotation } from 'src/entities/price-quotation/price-quotation.entity';
import { Truck } from 'src/entities/truck/truck.entity';
import { Tracking } from 'src/entities/tracking/tracking.entity';
import { AdditionalPrice } from 'src/entities/additional-price/additional-price.entity';
import { Folder } from 'src/entities/folder/folder.entity';
import { File } from 'src/entities/file/file.entity';
import { Note } from 'src/entities/note/note.entity';
import { Log } from 'src/entities/log/log.entity';
import { AuditLog } from 'src/entities/audit-log/audit-log.entity';
import { Province } from 'src/entities/province/province.entity';
import { NotificationInstance } from 'src/entities/notification-instance/notification-instance.entity';
import { Otp } from 'src/entities/otp/otp.entity';
import { OtpLog } from 'src/entities/otpLog/otpLog.entity';
import { Settings } from 'src/entities/setting/setting.entity';
import { Address } from 'src/entities/address/address.entity';
import { AdminSetting } from 'src/entities/admin-setting/admin-setting.entity';
import { BlackBox } from 'src/entities/black-box/black-box.entity';
import { DefaultReference } from 'src/entities/default-reference/default-reference.entity';
import { DistancePrice } from 'src/entities/distance-price/distance-price.entity';
import { Distance } from 'src/entities/distance/distance.entity';
import { DynamicCharges } from 'src/entities/dynamic-charges/dynamic-charges.entity';
import { ImportantNote } from 'src/entities/important-notes/important-notes.entity';
import { MultipleStopsCharges } from 'src/entities/multiple-stops-price/multiple-stops-price.entity';
import { PayloadFare } from 'src/entities/payload-fare/payload-fare.entity';
import { DefaultPayment } from 'src/entities/payment/payment.entity';
import { Pricing } from 'src/entities/pricing/pricing.entity';
import { SpecialRequest } from 'src/entities/special-request/special-request.entity';
import { SurCharges } from 'src/entities/surcharges/surcharges.entity';
import { TrackingBlackBoxLog } from 'src/entities/tracking-black-box-log/tracking-black-box-log.entity';
import { TrackingBlackBox } from 'src/entities/tracking-black-box/tracking-black-box.entity';
import { TruckTypeFare } from 'src/entities/truck-type-fare/truck-type-fare.entity';
import { TruckOwnerBankAccount } from 'src/entities/truckowner-bankaccount/truckowner-bankaccount.entity';
import { ZonePrice } from 'src/entities/zone-price/zone-price.entity';
import { Notification } from 'src/entities/notification/notification.entity';
import { USER_TYPE } from 'src/entities/admin/enums/userType.enum';
import { customThrowError } from 'src/common/helpers/throw.helper';
import { Request } from 'express';
import {
  RESPONSE_MESSAGES,
  RESPONSE_MESSAGES_CODE,
} from 'src/common/constants/response-messages.enum';

@Injectable()
export class SyncService {
  canSync = true;

  constructor(
    @InjectRepository(SyncSetting)
    private readonly syncSettingRepository: Repository<SyncSetting>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async syncDataApi(request: Request): Promise<any> {
    const admin = await this.adminRepository.findOne({
      id: (request as any).user.id,
    });
    if (admin.userType !== USER_TYPE.SUPER_ADMIN) {
      customThrowError(
        RESPONSE_MESSAGES.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
        RESPONSE_MESSAGES_CODE.UNAUTHORIZED,
      );
    }
    if (!this.canSync) {
      return {
        status: false,
        code: RESPONSE_MESSAGES_CODE.SYNC_DATA_IS_PROCESSING,
      };
    }
    this.canSync = false;
    this.syncData();
    return {
      status: true,
    };
  }

  // @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  // async handleCron() {
  //   await this.syncData();
  // }

  async syncData() {
    const settings = await this.syncSettingRepository.find({
      shouldSync: true,
    });
    if (settings && settings.length > 0) {
      for (const setting of settings) {
        // setting.shouldSync = false;
        // this.syncSettingRepository.save(setting);
        for (const syncTo of setting.syncTo) {
          const settingTo = await this.syncSettingRepository.findOne({
            server: syncTo,
          });
          if (settingTo) {
            console.log('Start sync company table');
            const ignoreCompanyColumns = [
              'updatedDate',
              'createdDate',
              'syncCode',
              'syncDate',
              'shouldSync',
            ];
            await this.syncDataTable(
              setting,
              settingTo,
              'company',
              ignoreCompanyColumns,
              1000,
            );
            console.log('End sync company table');

            console.log('Start sync truck_owner table');
            const ignoreTruckOwnerColumns = [
              'updatedDate',
              'createdDate',
              'session',
              'syncCode',
              'syncDate',
              'shouldSync',
            ];
            await this.syncDataTable(
              setting,
              settingTo,
              'truck_owner',
              ignoreTruckOwnerColumns,
              1000,
            );
            console.log('End sync truck_owner table');

            console.log('Start sync truck table');
            const ignoreTruckColumns = [
              'updatedDate',
              'createdDate',
              'syncCode',
              'syncDate',
              'shouldSync',
            ];
            await this.syncDataTable(
              setting,
              settingTo,
              'truck',
              ignoreTruckColumns,
              1000,
            );
            console.log('End sync truck table');

            console.log('Start sync driver table');
            const ignoreDriverColumns = [
              'updatedDate',
              'createdDate',
              'session',
              'syncCode',
              'syncDate',
              'shouldSync',
            ];
            await this.syncDataTable(
              setting,
              settingTo,
              'driver',
              ignoreDriverColumns,
              1000,
            );
            console.log('End sync driver table');
          }
        }
      }
    }
    this.canSync = true;
  }

  async getServerConnection(connName, authInfo) {
    try {
      return getConnection(connName);
    } catch (e) {
      if (e.name === 'ConnectionNotFoundError') {
        try {
          await createConnections([
            {
              name: connName,
              type: 'postgres',
              entities: [
                Log,
                AuditLog,
                File,
                Customer,
                Driver,
                TruckOwner,
                Company,
                Admin,
                Truck,
                Order,
                Province,
                Tracking,
                Folder,
                Notification,
                NotificationInstance,
                Note,
                Otp,
                OtpLog,
                Settings,
                Address,
                DefaultReference,
                DefaultPayment,
                AdminSetting,
                SpecialRequest,
                ZonePrice,
                PayloadFare,
                TruckTypeFare,
                SurCharges,
                DynamicCharges,
                DistancePrice,
                Pricing,
                Distance,
                ImportantNote,
                TruckOwnerBankAccount,
                AdditionalPrice,
                MultipleStopsCharges,
                BlackBox,
                TrackingBlackBox,
                TrackingBlackBoxLog,
                PriceQuotation,
                SyncSetting,
              ],
              ...authInfo,
            },
          ]);
        } catch (e) {
          console.log(e);
          return false;
        }
        return getConnection(connName);
      }
    }
  }

  async syncDataTable(
    settingFrom,
    settingTo,
    table,
    ignoreColumn,
    limit,
    primaryKey = 'id',
  ) {
    const connFrom = await this.getServerConnection(
      settingFrom.server,
      settingFrom.authInfo,
    );
    if (connFrom === false) {
      console.log('connect from fail');
      return false;
    }
    const connTo = await this.getServerConnection(
      settingTo.server,
      settingTo.authInfo,
    );
    if (connTo === false) {
      console.log('connect to fail');
      return false;
    }

    await connFrom.manager.query(`UPDATE ${table} SET "shouldSync" = $1`, [
      true,
    ]);

    const columns = await connFrom.manager.query(
      'SELECT column_name FROM information_schema.columns WHERE table_name = $1',
      [table],
    );

    const columnSyncs = columns
      .filter(c => !ignoreColumn.includes(c.column_name))
      .map(c => c.column_name);

    let running = false;
    do {
      if (table === 'company') {
        running = await this.processDataCompany(
          settingFrom,
          connFrom,
          connTo,
          primaryKey,
          columnSyncs,
          limit,
        );
      } else if (table === 'truck_owner') {
        running = await this.processDataTruckOwner(
          settingFrom,
          connFrom,
          connTo,
          primaryKey,
          columnSyncs,
          limit,
        );
      } else if (table === 'truck') {
        running = await this.processDataTruck(
          settingFrom,
          connFrom,
          connTo,
          primaryKey,
          columnSyncs,
          limit,
        );
      } else if (table === 'driver') {
        running = await this.processDataDriver(
          settingFrom,
          connFrom,
          connTo,
          primaryKey,
          columnSyncs,
          limit,
        );
      }
    } while (running);
    // await connTo.manager.query('PRAGMA foreign_keys = ON');
  }

  async processDataCompany(
    settingFrom,
    connFrom,
    connTo,
    primaryKey,
    columnSyncs,
    limit,
  ) {
    const columnSelect = columnSyncs.map(c => `company."${c}"`);

    const data = await connFrom
      .createQueryBuilder()
      .select(columnSelect)
      .from(Company, 'company')
      .where({ shouldSync: true })
      .limit(limit)
      .getRawMany();

    if (!data || data.length === 0) {
      return false;
    }

    const ids = [];
    const values = data.map(dat => {
      ids.push(dat[primaryKey]);
      dat['syncCode'] = `${settingFrom.server}_${dat[primaryKey]}`;
      delete dat[primaryKey];
      return dat;
    });

    if (ids.length === 0) {
      return false;
    }
    await connFrom
      .createQueryBuilder()
      .update(Company)
      .set({
        shouldSync: false,
      })
      .where('company.id IN (:...ids)', { ids: ids })
      .execute();

    const updateColumns = [];
    columnSyncs.map(c => {
      if (c !== primaryKey) {
        updateColumns.push(`"${c}" = EXCLUDED."${c}"`);
      }
    });

    await connTo
      .createQueryBuilder()
      .insert()
      .into(Company)
      .values(values)
      .onConflict(`("syncCode") DO UPDATE SET ${updateColumns.join(',')}`)
      .execute();

    if (ids.length < limit) {
      return false;
    }
    return true;
  }

  async processDataTruckOwner(
    settingFrom,
    connFrom,
    connTo,
    primaryKey,
    columnSyncs,
    limit,
  ) {
    const columnSelect = columnSyncs.map(c => `truck_owner."${c}"`);

    const data = await connFrom
      .createQueryBuilder()
      .select(columnSelect)
      .from(TruckOwner, 'truck_owner')
      .where({ shouldSync: true })
      .limit(limit)
      .getRawMany();

    if (!data || data.length === 0) {
      return false;
    }

    const syncCodeCompany = data
      .filter(dat => dat.companyId)
      .map(dat => `${settingFrom.server}_${dat.companyId}`);

    let idsCompanyTo = {};
    if (syncCodeCompany && syncCodeCompany.length > 0) {
      const companyTo = await connTo
        .createQueryBuilder()
        .select(['company."id"', 'company."syncCode"'])
        .from(Company, 'company')
        .where('company."syncCode" IN (:...syncCode)', {
          syncCode: syncCodeCompany,
        })
        .getRawMany();
      if (companyTo && companyTo.length > 0) {
        idsCompanyTo = this.convertArrayToObject(companyTo, 'syncCode', 'id');
      }
    }

    const ids = [];
    const emails = [];
    const publicIds = [];
    let values = data.map(dat => {
      ids.push(dat[primaryKey]);
      if (dat['email']) {
        emails.push(dat['email']);
      }
      if (dat['publicId']) {
        publicIds.push(dat['publicId']);
      }
      dat['companyId'] =
        idsCompanyTo[`${settingFrom.server}_${dat.companyId}`] || null;
      dat['syncCode'] = `${settingFrom.server}_${dat[primaryKey]}`;
      delete dat[primaryKey];
      return dat;
    });
    if (ids.length === 0) {
      return false;
    }

    await connFrom
      .createQueryBuilder()
      .update(TruckOwner)
      .set({
        shouldSync: false,
      })
      .where('truck_owner.id IN (:...ids)', { ids: ids })
      .execute();

    if (emails.length > 0 || publicIds.length > 0) {
      const checkDuplicateData = await connTo
        .createQueryBuilder()
        .select(['truck_owner."email"', 'truck_owner."publicId"'])
        .from(TruckOwner, 'truck_owner')
        .where('truck_owner."syncCode" IS NULL')
        .andWhere(
          new Brackets(qb => {
            if (emails.length > 0) {
              qb.orWhere('truck_owner."email" IN (:...emails)', {
                emails: emails,
              });
            }
            if (publicIds.length > 0) {
              qb.orWhere('truck_owner."publicId" IN (:...publicIds)', {
                publicIds: publicIds,
              });
            }
          }),
        )
        .withDeleted()
        .getRawMany();

      if (checkDuplicateData.length > 0) {
        values = values.filter(
          v =>
            !checkDuplicateData.find(
              c =>
                (c.email && c.email === v.email) ||
                (c.publicId && c.publicId === v.publicId),
            ),
        );
      }
    }

    const updateColumns = [];
    columnSyncs.map(c => {
      if (c !== primaryKey) {
        updateColumns.push(`"${c}" = EXCLUDED."${c}"`);
      }
    });

    await connTo
      .createQueryBuilder()
      .insert()
      .into(TruckOwner)
      .values(values)
      .onConflict(`("syncCode") DO UPDATE SET ${updateColumns.join(',')}`)
      .execute();

    if (ids.length < limit) {
      return false;
    }
    return true;
  }

  async processDataTruck(
    settingFrom,
    connFrom,
    connTo,
    primaryKey,
    columnSyncs,
    limit,
  ) {
    const columnSelect = columnSyncs.map(c => `truck."${c}"`);

    const data = await connFrom
      .createQueryBuilder()
      .select(columnSelect)
      .from(Truck, 'truck')
      .where({ shouldSync: true })
      .limit(limit)
      .getRawMany();

    if (!data || data.length === 0) {
      return false;
    }

    const syncCodeTruckOwner = data
      .filter(dat => dat.ownerId)
      .map(dat => `${settingFrom.server}_${dat.ownerId}`);

    let idsTruckOwnerTo = {};
    if (syncCodeTruckOwner && syncCodeTruckOwner.length > 0) {
      const truckOwnerTo = await connTo
        .createQueryBuilder()
        .select(['truck_owner."id"', 'truck_owner."syncCode"'])
        .from(TruckOwner, 'truck_owner')
        .where('truck_owner."syncCode" IN (:...syncCode)', {
          syncCode: syncCodeTruckOwner,
        })
        .getRawMany();

      if (truckOwnerTo && truckOwnerTo.length > 0) {
        idsTruckOwnerTo = this.convertArrayToObject(
          truckOwnerTo,
          'syncCode',
          'id',
        );
      }
    }

    const ids = [];
    const values = [];
    for (const dat of data) {
      const idKey = dat[primaryKey];
      delete dat[primaryKey];
      ids.push(idKey);
      if (
        dat.ownerId &&
        !idsTruckOwnerTo[`${settingFrom.server}_${dat.ownerId}`]
      ) {
        continue;
      }
      values.push({
        ...dat,
        ownerId:
          idsTruckOwnerTo[`${settingFrom.server}_${dat.ownerId}`] || null,
        syncCode: `${settingFrom.server}_${idKey}`,
      });
    }

    if (ids.length === 0) {
      return false;
    }
    await connFrom
      .createQueryBuilder()
      .update(Truck)
      .set({
        shouldSync: false,
      })
      .where('truck.id IN (:...ids)', { ids: ids })
      .execute();

    const updateColumns = [];
    columnSyncs.map(c => {
      if (c !== primaryKey) {
        updateColumns.push(`"${c}" = EXCLUDED."${c}"`);
      }
    });

    await connTo
      .createQueryBuilder()
      .insert()
      .into(Truck)
      .values(values)
      .onConflict(`("syncCode") DO UPDATE SET ${updateColumns.join(',')}`)
      .execute();

    if (ids.length < limit) {
      return false;
    }
    return true;
  }

  async processDataDriver(
    settingFrom,
    connFrom,
    connTo,
    primaryKey,
    columnSyncs,
    limit,
  ) {
    const columnSelect = columnSyncs.map(c => `driver."${c}"`);

    const data = await connFrom
      .createQueryBuilder()
      .select(columnSelect)
      .from(Driver, 'driver')
      .where({ shouldSync: true })
      .limit(limit)
      .getRawMany();

    if (!data || data.length === 0) {
      return false;
    }

    const syncCodeTruckOwner = data
      .filter(dat => dat.ownerId)
      .map(dat => `${settingFrom.server}_${dat.ownerId}`);

    let idsTruckOwnerTo = {};
    if (syncCodeTruckOwner && syncCodeTruckOwner.length > 0) {
      const truckOwnerTo = await connTo
        .createQueryBuilder()
        .select(['truck_owner."id"', 'truck_owner."syncCode"'])
        .from(TruckOwner, 'truck_owner')
        .where('truck_owner."syncCode" IN (:...syncCode)', {
          syncCode: syncCodeTruckOwner,
        })
        .getRawMany();

      if (truckOwnerTo && truckOwnerTo.length > 0) {
        idsTruckOwnerTo = this.convertArrayToObject(
          truckOwnerTo,
          'syncCode',
          'id',
        );
      }
    }

    const ids = [];
    let values = [];
    const emails = [];
    const phoneNumbers = [];
    for (const dat of data) {
      const idKey = dat[primaryKey];
      delete dat[primaryKey];
      ids.push(idKey);
      if (
        dat.ownerId &&
        !idsTruckOwnerTo[`${settingFrom.server}_${dat.ownerId}`]
      ) {
        continue;
      }
      if (dat['email']) {
        emails.push(dat['email']);
      }
      if (dat['phoneNumber']) {
        phoneNumbers.push(dat['phoneNumber']);
      }
      values.push({
        ...dat,
        ownerId:
          idsTruckOwnerTo[`${settingFrom.server}_${dat.ownerId}`] || null,
        syncCode: `${settingFrom.server}_${idKey}`,
      });
    }

    if (ids.length === 0) {
      return false;
    }
    await connFrom
      .createQueryBuilder()
      .update(Driver)
      .set({
        shouldSync: false,
      })
      .where('driver.id IN (:...ids)', { ids: ids })
      .execute();

    if (emails.length > 0 || phoneNumbers.length > 0) {
      const checkDuplicateData = await connTo
        .createQueryBuilder()
        .select(['driver."email"', 'driver."phoneNumber"'])
        .from(Driver, 'driver')
        .where('driver."syncCode" IS NULL')
        .andWhere(
          new Brackets(qb => {
            if (emails.length > 0) {
              qb.orWhere('driver."email" IN (:...emails)', {
                emails: emails,
              });
            }
            if (phoneNumbers.length > 0) {
              qb.orWhere('driver."phoneNumber" IN (:...phoneNumbers)', {
                phoneNumbers: phoneNumbers,
              });
            }
          }),
        )
        .withDeleted()
        .getRawMany();

      if (checkDuplicateData.length > 0) {
        values = values.filter(
          v =>
            !checkDuplicateData.find(
              c =>
                (c.email && c.email === v.email) ||
                (c.phoneNumber && c.phoneNumber === v.phoneNumber),
            ),
        );
      }
    }

    const updateColumns = [];
    columnSyncs.map(c => {
      if (c !== primaryKey) {
        updateColumns.push(`"${c}" = EXCLUDED."${c}"`);
      }
    });

    await connTo
      .createQueryBuilder()
      .insert()
      .into(Driver)
      .values(values)
      .onConflict(`("syncCode") DO UPDATE SET ${updateColumns.join(',')}`)
      .execute();

    if (ids.length < limit) {
      return false;
    }
    return true;
  }

  convertArrayToObject = (array, key, column = null) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
      return {
        ...obj,
        [item[key]]: column ? item[column] : item,
      };
    }, initialValue);
  };
}

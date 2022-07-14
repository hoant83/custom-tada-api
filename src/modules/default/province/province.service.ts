import { Injectable, OnModuleInit } from '@nestjs/common';
import { FindManyOptions, Like, Repository } from 'typeorm';
import { Province } from 'src/entities/province/province.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { VN_CITIES } from './vn-cities';
import { TH_CITIES } from './th-cities';
import { ProvinceRequestDto } from '../../../dto/province/province-request.dto';
import { COUNTRY } from 'src/entities/province/enums/country.enum';

@Injectable()
export class ProvinceService implements OnModuleInit {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.import();
  }

  async import(): Promise<boolean> {
    let cities: any = {};
    switch (process.env.REGION) {
      case COUNTRY.THAILAND:
        cities = TH_CITIES;
        break;
      default:
        cities = VN_CITIES;
        break;
    }

    const existed = await this.provinceRepository.find();

    const provinceArr = [];
    for (const province in cities) {
      const currentProvince = cities[province];
      const provinceModel = this.provinceRepository.create({
        code: 'C' + currentProvince.code,
        type: currentProvince.type ?? 'city',
        slug: currentProvince.slug,
        name: currentProvince.name,
        nameWithType: currentProvince.name_with_type,
        countryCode: process.env.REGION ?? COUNTRY.VIETNAM,
      });

      if (existed.findIndex(x => x.code === provinceModel.code) === -1) {
        provinceArr.push(provinceModel);
      }
    }

    try {
      await this.provinceRepository.save(provinceArr);
    } catch {}
    return true;
  }

  async getList(filterOptionsModel: ProvinceRequestDto): Promise<any> {
    const { skip, take, searchBy, searchKeyword } = filterOptionsModel;
    const order = {};
    const where = [];

    if (filterOptionsModel.orderBy) {
      order[filterOptionsModel.orderBy] = filterOptionsModel.orderDirection;
    } else {
      (order as any).name = 'ASC';
    }

    if (searchBy && searchKeyword) {
      where.push({ [searchBy]: Like(`%${searchKeyword}%`) });
    }

    const options: FindManyOptions<Province> = {
      where,
      skip,
      take,
      order,
      cache: true,
    };

    options.where = { ...where, countryCode: process.env.REGION };

    const [result, count] = await this.provinceRepository.findAndCount(options);
    const provinces = [];
    const provincesIndex = [];
    let merge = [];
    result.forEach((item: any) => {
      if (item.index === 1) {
        provincesIndex.push(item);
        return;
      }
      provinces.push(item);
    });
    merge = provincesIndex.concat(provinces);
    return [merge, count];
  }
}

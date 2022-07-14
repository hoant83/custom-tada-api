import { Repository, EntityRepository } from 'typeorm';
import { File } from 'src/entities/file/file.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { Company } from 'src/entities/company/company.entity';

@EntityRepository(Company)
export class CompanyRepository extends Repository<Company> {
  async getCompanyWithOptions(findOptions: { id: number }): Promise<Company> {
    const [a, b] = [
      REFERENCE_TYPE.COMPANY_ICON,
      REFERENCE_TYPE.BUSINESS_LICENSE,
    ];
    const company = await this.createQueryBuilder('company')
      .where('company.id = :id', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'company.company_icon',
        File,
        'company_icon',
        'company_icon.referenceType =:a and company_icon.referenceId = company.id',
        { a },
      )
      .leftJoinAndMapOne(
        'company.company_business_license',
        File,
        'company_business_license',
        'company_business_license.referenceType =:b and company_business_license.referenceId = company.id',
        { b },
      )
      .select()
      .addSelect(['company_icon', 'company_business_license'])
      .getOne();
    return company;
  }
}

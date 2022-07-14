import { Repository, EntityRepository } from 'typeorm';
import { Truck } from 'src/entities/truck/truck.entity';
import { REFERENCE_TYPE } from 'src/entities/file/enums/referenceType.enum';
import { File } from 'src/entities/file/file.entity';

@EntityRepository(Truck)
export class TruckRepository extends Repository<Truck> {
  async getTruckWithOptions(findOptions: { id: number }): Promise<Truck> {
    const [a, b] = [
      REFERENCE_TYPE.TRUCK_CERTIFICATE,
      REFERENCE_TYPE.OTHER_TRUCK_DOCUMENT,
    ];

    const truck = await this.createQueryBuilder('truck')
      .where('truck.id = :id', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'truck.certificate',
        File,
        'certificate',
        'certificate.referenceType =:a and certificate.referenceId = truck.id',
        { a },
      )
      .leftJoinAndMapMany(
        'truck.otherDocuments',
        File,
        'otherDocument',
        'otherDocument.referenceType =:b and otherDocument.referenceId = truck.id',
        { b },
      )
      .select()
      .addSelect('certificate')
      .getOne();

    return truck;
  }

  async getTrucksWithOptions(findOptions: { ownerId: number }): Promise<any> {
    const [a, b] = [
      REFERENCE_TYPE.TRUCK_CERTIFICATE,
      REFERENCE_TYPE.OTHER_TRUCK_DOCUMENT,
    ];

    const truck = await this.createQueryBuilder('truck')
      .where('truck.ownerId = :ownerId', {
        ...findOptions,
      })
      .leftJoinAndMapOne(
        'truck.certificate',
        File,
        'certificate',
        'certificate.referenceType =:a and certificate.referenceId = truck.id',
        { a },
      )
      .leftJoinAndMapOne(
        'truck.other_document',
        File,
        'other_document',
        'other_document.referenceType =:b and other_document.referenceId = truck.id',
        { b },
      )
      .select()
      .addSelect('certificate')
      .getMany();

    return truck;
  }
}

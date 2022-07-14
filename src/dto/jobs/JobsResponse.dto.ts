import { Order } from 'src/entities/order/order.entity';
import { Exclude, Expose } from 'class-transformer';
import { File } from 'src/entities/file/file.entity';
import { Driver } from 'src/entities/driver/driver.entity';

export class JobsResponseDto extends Order {
  @Exclude()
  document: File[];

  @Expose({
    name: 'metadata',
  })
  get metadata(): any[] {
    return this.document.map(d => ({
      link: `${process.env.BACKEND_HOST}/api/assets/${d.id}.${d.extension}`,
      fileName: d.fileName,
    }));
  }

  @Expose({
    name: 'documentLinks',
  })
  get documentLinks(): string[] {
    return this.document.map(
      d => `${process.env.BACKEND_HOST}/api/assets/${d.id}.${d.extension}`,
    );
  }

  @Exclude()
  drivers: Driver[];

  @Expose({
    name: 'driversData',
  })
  get driversData(): any {
    if (this.drivers) {
      const driverData = this.drivers.map(d => ({
        id: d.id,
        phoneNumber: d.phoneNumber,
        email: d.email,
        firstName: d.firstName,
        cardNo: d.cardNo,
      }));

      return driverData;
    }
  }
  //
  // @Exclude()
  // createdByCustomer: Customer;
  //
  // @Expose({
  //   name: 'createdByData',
  // })
  // get createdByData(): any {
  //   const createdBy = {
  //     email: this.createdByCustomer.email,
  //     firstName: this.createdByCustomer.firstName,
  //     phoneNumber: this.createdByCustomer.phoneNumber,
  //   };
  //
  //   return createdBy;
  // }

  @Expose({
    name: 'priceCalculate',
  })
  get priceCalculate(): number {
    if (!this.isSetCommission) {
      return null;
    }
    if (!this.allowSeePrice) {
      return null;
    }
    let total = 0;
    if (this.useSuggestedPrice) {
      total = this.suggestedPrice;
    } else {
      total = this.priceRequest;
    }
    if (this.additionalPrices && this.additionalPrices.length > 0) {
      total += this.additionalPrices
        .map(item => item.price)
        .reduce((x, y) => x + y);
    }
    return total;
  }

  @Expose({
    name: 'commission',
  })
  get commission(): number {
    if (!this.isSetCommission) {
      return null;
    }
    if (!this.allowSeeCommission) {
      return null;
    }

    let total = 0;
    if (this.useSuggestedPrice) {
      total = this.suggestedPrice;
    } else {
      total = this.priceRequest;
    }
    if (this.additionalPrices && this.additionalPrices.length > 0) {
      total += this.additionalPrices
        .map(item => item.price)
        .reduce((x, y) => x + y);
    }

    const fixedComm = this.fixedCommission ?? 0;
    const percentComm = this.percentCommission ?? 0;
    return (total * percentComm) / 100 + fixedComm;
  }

  constructor(partial: Partial<Order> = {}, isEnableCommissionFeature = false) {
    super();
    partial.allowSeeCommission =
      isEnableCommissionFeature &&
      partial.isSetCommission &&
      partial.allowSeeCommission;
    Object.assign(this, partial);
  }
}

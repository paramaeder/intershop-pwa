import { DatePipe, DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Attribute } from '../../models/attribute/attribute.model';
import { Price } from '../../models/price/price.model';
import { PricePipe } from './price.pipe';

@Pipe({ name: 'ishAttribute' })
export class AttributeToStringPipe implements PipeTransform {
  constructor(
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private pricePipe: PricePipe
  ) {}

  private toDate(val): string {
    return this.datePipe.transform(val, 'shortDate', undefined, this.translateService.currentLang);
  }

  private toDecimal(val): string {
    return this.decimalPipe.transform(val, undefined, this.translateService.currentLang);
  }

  private toCurrency(price: Price): string {
    return this.pricePipe.transform(price);
  }

  transform(data: Attribute, valuesSeparator: string = ', '): string {
    switch (data.type) {
      case 'String':
        return data.value;
      case 'Integer':
      case 'Double':
      case 'Long':
      case 'BigDecimal':
        return this.toDecimal(data.value);
      case 'Boolean':
        return data.value.toString();
      case 'Date':
        // TODO: ISREST-222 - waiting for adaption of REST API response to return Date values not as 'String' so they can be handled accordingly
        return this.toDate(data.value);
      case 'MultipleInteger':
      case 'MultipleDouble':
      case 'MultipleLong':
      case 'MultipleBigDecimal':
        return data.value.map(v => this.toDecimal(v)).join(valuesSeparator);
      case 'MultipleString':
      case 'MultipleBoolean':
        return data.value.join(valuesSeparator);
      case 'MultipleDate':
        return data.value.map(v => this.toDate(v)).join(valuesSeparator);
      case 'ResourceAttribute':
        switch (data.value.type) {
          case 'Quantity':
            return `${this.toDecimal(data.value.value)}\xA0${data.value.unit}`;
          case 'Money':
            return this.toCurrency(data.value as Price);
          default:
            return data.value.toString();
        }
      default:
        return data.value.toString();
    }
  }
}
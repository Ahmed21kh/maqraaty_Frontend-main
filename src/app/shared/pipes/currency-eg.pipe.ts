import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyEg',
  standalone: true
})
export class CurrencyEgPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    return `ج ${ value} `;
  }

}

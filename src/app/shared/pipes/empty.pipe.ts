import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'empty',
  standalone: true
})
export class EmptyPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (value === null || value === undefined || value === '' || value[0] === '') {
      return '____' ;
    }
    return value
  }

}

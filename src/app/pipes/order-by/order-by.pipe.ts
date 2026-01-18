import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy',
  standalone: true
})
export class OrderByPipe implements PipeTransform {

  transform(array: any[], field: string, isAscending: boolean): any[] {
    array.sort((a: any, b: any) => {
      // Use 'ar' for Arabic or 'en' for English
      const locale = 'ar'; // Change this to 'en' for English sorting
      if (isAscending) {
        return a[field].localeCompare(b[field], locale);
      } else {
        return b[field].localeCompare(a[field], locale);
      }
    });
    return array;
 }


}

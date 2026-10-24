import { Pipe, PipeTransform } from '@angular/core';

const collator = new Intl.Collator('ar');

@Pipe({
  name: 'orderBy',
  standalone: true
})
export class OrderByPipe implements PipeTransform {

  /**
   * Returns a sorted copy. The input array is left untouched, so the source data
   * (often shared through signals / services) is never reordered as a side effect.
   */
  transform(array: any[] | null | undefined, field: string, isAscending: boolean): any[] {
    if (!array) return [];
    const direction = isAscending ? 1 : -1;
    return [...array].sort((a: any, b: any) => direction * collator.compare(a[field], b[field]));
  }
}

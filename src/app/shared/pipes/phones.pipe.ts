import { Pipe, PipeTransform } from '@angular/core';

/** Joins a phone list, ignoring blanks. Returns `____` (same placeholder as `empty`) when nothing is left. */
@Pipe({ name: 'phones', standalone: true })
export class PhonesPipe implements PipeTransform {
  transform(value: readonly (string | null | undefined)[] | string | null | undefined, separator = ' - '): string {
    const list = Array.isArray(value) ? value : [value];
    const clean = list.filter((p): p is string => !!p && !!p.trim());
    return clean.length ? clean.join(separator) : '____';
  }
}

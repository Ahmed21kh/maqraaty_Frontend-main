import { StudentItem } from '../models/app.model';
import { normalizeArabic } from './text.util';

/**
 * Read-only view of a student prepared for rendering.
 * Raw API data (`source`) is never modified — derived fields live beside it.
 */
export interface StudentView<T extends Partial<StudentItem> = StudentItem> {
  readonly source: T;
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  /** All non-empty phone numbers across phone_1..phone_3. */
  readonly phones: readonly string[];
  readonly primaryPhone: string;
  readonly imagePath: string | null;
  readonly isActive: boolean;
  /** Normalised haystack (see `normalizeArabic`) used by client-side search. */
  readonly searchKey: string;
}

const cache = new WeakMap<object, StudentView<any>>();

function cleanPhones(...lists: (string[] | undefined)[]): string[] {
  const out: string[] = [];
  for (const list of lists) {
    for (const phone of list ?? []) {
      if (phone && phone.trim()) out.push(phone.trim());
    }
  }
  return out;
}

export function getInitials(name: string | undefined | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '؟';
  return parts.length === 1 ? parts[0].charAt(0) : parts[0].charAt(0) + parts[1].charAt(0);
}

/** Maps one API student into a view-model. Memoised per source object. */
export function toStudentView<T extends Partial<StudentItem>>(student: T): StudentView<T> {
  const hit = cache.get(student);
  if (hit) return hit;

  const phones = cleanPhones(student.phone_1, student.phone_2, student.phone_3);
  const view: StudentView<T> = Object.freeze({
    source: student,
    id: student._id ?? '',
    name: student.name ?? '',
    initials: getInitials(student.name),
    phones: Object.freeze(phones),
    primaryPhone: phones[0] ?? '',
    imagePath: student.image || null,
    isActive: student.active_status ? student.active_status === 'active' : true,
    searchKey: normalizeArabic(`${student.name ?? ''} ${student.code ?? ''} ${phones.join(' ')}`),
  });
  cache.set(student, view);
  return view;
}

export function toStudentViews<T extends Partial<StudentItem>>(students: readonly T[] | null | undefined): StudentView<T>[] {
  return (students ?? []).map(toStudentView);
}

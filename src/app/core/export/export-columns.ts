import { ExportColumn } from '../services/table-export.service';

const first = (v: unknown): string => (Array.isArray(v) ? String(v[0] ?? '') : String(v ?? ''));
const statusOf = (s?: string): string => (s === 'in_active' ? 'غير نشط' : s === 'active' ? 'نشط' : '');

/** Columns of the students tables (all / active / inactive / unpaid subscriptions). */
export const STUDENT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'الكود', value: (s) => s.code, width: 9 },
  { header: 'الاسم', value: (s) => s.name, width: 30 },
  { header: 'رقم الهاتف', value: (s) => first(s.phone_1), width: 16 },
  { header: 'تاريخ التسجيل', value: (s) => dateOf(s.date), width: 14 },
  { header: 'المصروفات', value: (s) => (s.is_payment === 'لا' ? s.amount : 'يستثني'), width: 12 },
  { header: 'العنوان', value: (s) => s.address, width: 28 },
  { header: 'الحالة', value: (s) => statusOf(s.active_status), width: 11 },
  /** The stored photo path, only in Excel: importing the sheet again keeps every student's photo exactly as it is. */
  { header: 'الصورة', value: (s) => s.image || '', width: 22, formats: ['xlsx'] },
];

const dateOf = (v: unknown): string => {
  if (!v) return '';
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? '' : `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

/** Rows that carry `studentDetails` (payments and the paid-expenses ledger). */
export const PAYMENT_EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'الكود', value: (r) => r.studentDetails?.code, width: 9 },
  { header: 'الاسم', value: (r) => r.studentDetails?.name, width: 30 },
  { header: 'رقم الهاتف', value: (r) => first(r.studentDetails?.phone_1), width: 16 },
  { header: 'التاريخ', value: (r) => dateOf(r.date), width: 14 },
  { header: 'المبلغ', value: (r) => r.amount, width: 12 },
];

export { dateOf, first };

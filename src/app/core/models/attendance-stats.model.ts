/** `GET /api/attendance-stats` — attendance numbers for a month or a whole year. */
export type AttendanceScope = 'all' | 'active';

export interface AttendanceStudentBuckets {
  /** Students that have class days in the period. */
  scheduled: number;
  /** Attended at least once (القادمون). */
  came: number;
  /** Has absences but never attended. */
  absentOnly: number;
  /** Nothing recorded yet. */
  noRecord: number;
  /** came / scheduled, in percent (null when nobody is scheduled). */
  cameRate: number | null;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  /** Scheduled but not recorded (mostly future days). */
  unrecorded: number;
  scheduledDays: number;
  recordedDays: number;
  /** present / (present + absent), in percent; null when nothing is recorded. */
  attendanceRate: number | null;
  students: AttendanceStudentBuckets;
}

export interface AttendanceDay {
  /** YYYY-MM-DD */
  date: string;
  weekday: string;
  present: number;
  absent: number;
  unrecorded: number;
  attendanceRate: number | null;
}

export interface AttendanceMonth {
  month: number;
  present: number;
  absent: number;
  unrecorded: number;
  attendanceRate: number | null;
  studentsScheduled: number;
  studentsCame: number;
  cameRate: number | null;
}

export interface AttendanceStats {
  year: number;
  /** null = the summary covers the whole year. */
  month: number | null;
  scope: AttendanceScope;
  timezone: string;
  summary: AttendanceSummary;
  /** Only present when a month was requested. */
  daily?: AttendanceDay[];
  /** Always 12 entries, January → December. */
  monthly: AttendanceMonth[];
  /** Current snapshot of the student body, independent of the period. */
  students: { total: number; active: number; inactive: number; activeRate: number | null };
}

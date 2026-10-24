import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AttendanceScope, AttendanceStats } from '../models/attendance-stats.model';
import { PaidExpensesMonthly, PaidExpensesResponse } from '../models/paid-expenses.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { API_URL } from '../config/api.config';


/**
 * Single gateway to the REST backend.
 *
 * Endpoints, query strings and payloads are unchanged. What differs from the
 * previous version:
 *  - the (meaningless, preflight-triggering) request `Cache-Control` headers are gone;
 *  - no full students list is downloaded any more: pickers, search and name look-ups use the paginated
 *    `getStudentOptions` endpoint, a page (or a single student) at a time.
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly message = inject(NzMessageService);

  readonly url: string = inject(API_URL);


  // ---------------------------------------------------------------- helpers

  getDatesForDayOfWeek(year: any, month: any, dayOfWeek: number) {
    const dates = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === dayOfWeek) {
        let day: string;
        if (dayOfWeek == 1) {
          day = 'الاثنين';
        } else if (dayOfWeek == 6) {
          day = 'السبت';
        } else {
          day = 'الاربعاء';
        }
        dates.push({ date: new Date(date), day, status: '___' });
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  getDatesAndDays() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const saturdays = this.getDatesForDayOfWeek(currentYear, currentMonth, 6);
    const mondays = this.getDatesForDayOfWeek(currentYear, currentMonth, 1);
    const tuesdays = this.getDatesForDayOfWeek(currentYear, currentMonth, 3);

    const allDates: any[] = [...saturdays, ...mondays, ...tuesdays];
    allDates.sort((a: any, b: any) => <any>new Date(a.date) - <any>new Date(b.date));
    return allDates;
  }

  /**
   * One page of students for a dropdown (`GET /students_options`): `search` matches name or code,
   * `status` is active | in_active | '' (everyone), `exclude` leaves ids out and `ids` fetches just those students.
   */
  getStudentOptions(opts: { page?: number; limit?: number; search?: string; status?: string; exclude?: string[]; ids?: string[] }): Observable<{ data: { _id: string; name: string; code: number; image?: string }[]; total: number; hasMore: boolean }> {
    let params = new HttpParams();
    if (opts.ids?.length) {
      params = params.set('ids', opts.ids.join(','));
    } else {
      params = params.set('page', opts.page ?? 1).set('limit', opts.limit ?? 30);
      if (opts.search) params = params.set('search', opts.search);
      if (opts.status) params = params.set('status', opts.status);
      if (opts.exclude?.length) params = params.set('exclude', opts.exclude.join(','));
    }
    return this.http.get<any>(this.url + 'students_options', { params });
  }

  // ----------------------------------------------------------------- students

  //get active students data
  getStudents(pageNum: number, size: number, x: any = ''): Observable<any> {
    return this.http.get(this.url + `students?page=${pageNum}&limit=${size}&status=active${x}`);
  }

  //get All students data
  getAllStudents(pageNum: number, size: number, x: any = ''): Observable<any> {
    return this.http.get(this.url + `all-students?page=${pageNum}&limit=${size}${x}`);
  }

  //get students who did not pay
  getNotPayStudents(x: any, pageNum: number, size: number): Observable<any> {
    return this.http.get(this.url + `get_not_pay?page=${pageNum}&limit=${size}${x}`);
  }

  //get inactive students data
  getInActiveStudents(pageNum: number, size: number): Observable<any> {
    return this.http.get(this.url + `students?page=${pageNum}&limit=${size}&status=in_active`);
  }

  // get student next code
  getStudent_code(): Observable<any> {
    return this.http.get(this.url + `student_code`);
  }

  //get one student
  getOne_student(id: string): Observable<any> {
    return this.http.get(this.url + `one_student?Id=${id}`);
  }

  //add student
  addStudent(data: any): Observable<any> {
    return this.http.post(this.url + 'add_student', data);
  }

  //update student
  updateStudent(id: string, data: any): Observable<any> {
    return this.http.put(this.url + `update_student?id=${id}`, data);
  }

  //delete student
  delete_student(id: string): Observable<any> {
    return this.http.delete(this.url + `delete_student?id=${id}`);
  }

  //activate / deactivate a student
  activate_deActivate_Student(id: string, status: string): Observable<any> {
    return this.http
      .post(this.url + `activate-or-deactivate`, {
        activeStatus: status,
        student: id,
      })
      ;
  }

  //activate student
  activateStudent(id: string, status: string, date: Date): Observable<any> {
    return this.http
      .post(this.url + `activate-or-deactivate`, {
        activeStatus: status,
        student: id,
        activatedDate: date,
      })
      ;
  }

  // activate and deactivate students
  activate_deactivate_students(data: any): Observable<any> {
    return this.http.post(this.url + `activate-or-deactivate`, data);
  }

  //search students data
  searchStudent(x: any, pageNum: number, size: number): Observable<any> {
    return this.http.get(this.url + `search_student?page=${pageNum}&limit=${size}&${x}`);
  }

  // get activated and deactivated students
  get_activated_deactivated_students(pageNum: number, size: number, x?: any): Observable<any> {
    return this.http.get(this.url + `get-inactive-students?page=${pageNum}&limit=${size}${x}`);
  }

  // ----------------------------------------------------------------- payments

  getPaymentData(pageNum: number, size: number, date: string): Observable<any> {
    return this.http.get(this.url + `get_payments?page=${pageNum}&limit=${size}&date=${date}`);
  }

  getOnePaymentData(pageNum: number, size: number, id: any): Observable<any> {
    return this.http.get(this.url + `get_one_payment?page=${pageNum}&limit=${size}&studentId=${id}`);
  }

  addPayment(data: any, id: string): Observable<any> {
    return this.http.post(this.url + `add_payment?studentId=${id}`, data);
  }

  deletePayment(id: string): Observable<any> {
    return this.http.delete(this.url + `delete_payment?id=${id}`);
  }

  updatePayment(id: string, data: any): Observable<any> {
    return this.http.put(this.url + `update_payment?id=${id}`, data);
  }

  // --------------------------------------------------------------- attendance

  getAttendanceData(pageNum: number, size: number, x: any): Observable<any> {
    return this.http.get(this.url + `get_attendance?page=${pageNum}&limit=${size}${x}`);
  }

  addAttendance(data: any, id: string): Observable<any> {
    return this.http.post(this.url + `add_attendance?studentId=${id}`, data);
  }

  deleteAttendance(id: string): Observable<any> {
    return this.http.delete(this.url + `delete_attendance?id=${id}`);
  }

  updateAttendance(id: string, data: any): Observable<any> {
    return this.http.put(this.url + `update_attendance?id=${id}`, data);
  }

  // ------------------------------------------------------------- paid expenses

  /** Ledger of recorded payments. `x` is a `&from=…&to=…&name=…` suffix (see `buildQuery`). */
  getPaidExpenses(pageNum: number, size: number, x: string = ''): Observable<PaidExpensesResponse> {
    return this.http.get<PaidExpensesResponse>(this.url + `paid-expenses?page=${pageNum}&limit=${size}${x}`);
  }

  /** Totals per month for one year. */
  getPaidExpensesMonthly(year: number): Observable<PaidExpensesMonthly> {
    return this.http.get<PaidExpensesMonthly>(this.url + `paid-expenses/monthly?year=${year}`);
  }

  // ------------------------------------------------------- attendance statistics

  /** Attendance numbers for one month (`month` set) or a whole year (`month` null). */
  getAttendanceStats(year: number, month: number | null, scope: AttendanceScope): Observable<AttendanceStats> {
    const monthPart = month ? `&month=${month}` : '';
    return this.http.get<AttendanceStats>(this.url + `attendance-stats?year=${year}${monthPart}&scope=${scope}`);
  }

  // ------------------------------------------------------------------ reports

  getReports(startDate: string, endDate: string): Observable<any> {
    return this.http.get(this.url + `reports?startDate=${startDate}&endDate=${endDate}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AappServiceService {
  url: string = 'http://localhost:8080/api/';
  // url: string = `${environment.apiUrl}api/`;
  constructor(private http: HttpClient) {}

  getDatesForDayOfWeek(year: any, month: any, dayOfWeek: number) {
    const dates = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      if (date.getDay() === dayOfWeek) {
        let day =
          dayOfWeek == 1 ? 'الاثنين' : dayOfWeek == 6 ? 'السبت' : 'الاربعاء';
        dates.push({ date: new Date(date), day, status: '___' });
      }
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }
  getDatesAndDays() {
    // Get current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Get dates for Saturdays, Mondays, and Tuesdays in the current month
    const saturdays = this.getDatesForDayOfWeek(currentYear, currentMonth, 6); // 6 corresponds to Saturday
    const mondays = this.getDatesForDayOfWeek(currentYear, currentMonth, 1); // 1 corresponds to Monday
    const tuesdays = this.getDatesForDayOfWeek(currentYear, currentMonth, 3); // 2 corresponds to Tuesday
    const friday = this.getDatesForDayOfWeek(currentYear, currentMonth, 5); // 2 corresponds to Tuesday

    // Combine all dates
    const allDates: any[] = [...saturdays, ...mondays, ...tuesdays];

    // Sort dates in ascending order
    allDates.sort(
      (a: any, b: any) => <any>new Date(a.date) - <any>new Date(b.date)
    );
    console.log(allDates);
    return allDates;
  }

  //get active students data
  getStudents(pageNum: number, size: number , x:any=''): Observable<any> {
    let response = this.http.get(
      this.url + `students?page=${pageNum}&limit=${size}&status=active${x}`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      }
    );
    return response;
  }

    //get All students data
    getAllStudents(pageNum: number, size: number , x:any=''): Observable<any> {
      let response = this.http.get(
        this.url + `all-students?page=${pageNum}&limit=${size}${x}`,
        {
          headers: {
            'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
          },
        }
      );
      return response;
    }

  //get active students data
  getNotPayStudents(x:any , pageNum: number, size: number): Observable<any> {
    let response = this.http.get(
      this.url + `get_not_pay?page=${pageNum}&limit=${size}${x}`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      }
    );
    return response;
  }
  //get inactive students data
  getInActiveStudents(pageNum: number, size: number): Observable<any> {
    let response = this.http.get(
      this.url + `students?page=${pageNum}&limit=${size}&status=in_active`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      }
    );
    return response;
  }
  //get students name
  getStudents_names(status:string|null = null ): Observable<any> {
    let api = status? `students_name?active_status=${status}`:`students_name`
    let response = this.http.get(this.url + api, {
      headers: {
        'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
      },
    });
    return response;
  }
  // get student next code
  getStudent_code(): Observable<any> {
    let response = this.http.get(this.url + `student_code`, {
      headers: {
        'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
      },
    });
    return response;
  }
  //get students data
  getOne_student(id: string): Observable<any> {
    let response = this.http.get(this.url + `one_student?Id=${id}`, {
      headers: {
        'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
      },
    });
    return response;
  }

  //get students data
  addStudent(data: any): Observable<any> {
    let response = this.http.post(this.url + 'add_student', data);
    return response;
  }

  //update students data
  updateStudent(id: string, data: any): Observable<any> {
    let response = this.http.put(this.url + `update_student?id=${id}`, data);
    return response;
  }


    //activate_deActivate_Student a student
    delete_student(id: string): Observable<any> {
      let response = this.http.delete(this.url + `delete_student?id=${id}`);
      return response;
    }
  //activate_deActivate_Student a student
  activate_deActivate_Student(id: string , status:string): Observable<any> {
    let response = this.http.post(this.url + `activate-or-deactivate`, {
      activeStatus: status,
      student: id
    });
    return response;
  }

  //activate student
  activateStudent(id: string , status:string , date:Date ): Observable<any> {
    let response = this.http.post(this.url + `activate-or-deactivate`, {
      activeStatus: status,
      student: id,
      activatedDate: date
    });
    return response;
  }
  //searcg students data
  searchStudent(x: any, pageNum: number, size: number): Observable<any> {
    let response = this.http.get(
      this.url + `search_student?page=${pageNum}&limit=${size}&${x}`
    );
    return response;
  }

  //get payment data
  getPaymentData(pageNum: number, size: number, date: string): Observable<any> {
    let response = this.http.get(
      this.url + `get_payments?page=${pageNum}&limit=${size}&date=${date}`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      }
    );
    return response;
  }

  //get payment data of one
  getOnePaymentData(pageNum: number, size: number, id: any): Observable<any> {
    let response = this.http.get(
      this.url +
        `get_one_payment?page=${pageNum}&limit=${size}&studentId=${id}`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      }
    );
    return response;
  }

  //Add payment
  addPayment(data: any, id: string): Observable<any> {
    let response = this.http.post(
      this.url + `add_payment?studentId=${id}`,
      data
    );
    return response;
  }
  //delete payment
  deletePayment(id: string): Observable<any> {
    let response = this.http.delete(this.url + `delete_payment?id=${id}`, {
      headers: {
        'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
      },
    });
    return response;
  }

  //update students data
  updatePayment(id: string, data: any): Observable<any> {
    let response = this.http.put(this.url + `update_payment?id=${id}`, data);
    return response;
  }

  //get attendance data
  getAttendanceData(
    pageNum: number,
    size: number,
    x: any
  ): Observable<any> {
    let response = this.http.get(
      this.url + `get_attendance?page=${pageNum}&limit=${size}${x}`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      }
    );
    return response;
  }
  //Add Attendance
  addAttendance(data: any, id: string): Observable<any> {
    let response = this.http.post(
      this.url + `add_attendance?studentId=${id}`,
      data
    );
    return response;
  }
  //delete Attendance
  deleteAttendance(id: string): Observable<any> {
    let response = this.http.delete(this.url + `delete_attendance?id=${id}`, {
      headers: {
        'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
      },
    });
    return response;
  }

  //update Attendance data
  updateAttendance(id: string, data: any): Observable<any> {
    let response = this.http.put(this.url + `update_attendance?id=${id}`, data);
    return response;
  }

  // activate and deactivate students'
  activate_deactivate_students(data:any): Observable<any> {
    return this.http.post(this.url + `activate-or-deactivate`,data)
  }

    // get activated and deactivated students'
    get_activated_deactivated_students(
      pageNum: number,
      size: number,
      x?: any): Observable<any> {
      return this.http.get(this.url + `get-active-or-inactive?page=${pageNum}&limit=${size}${x}`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      })
    }

  //get attendance data
  getReports(startDate: string, endDate: string): Observable<any> {
    let response = this.http.get(
      this.url + `reports?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'Cache-Control': ' max-age=604800 , stale-while-revalidate=86400',
        },
      }
    );
    return response;
  }
}

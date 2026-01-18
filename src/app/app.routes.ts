import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home'},
  { path: 'home', loadChildren: () => import('./pages/home/home.routes').then(m => m.Home_ROUTES),data:{home:true} },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'registerd', loadChildren: () => import('./pages/registered-students/registerdStudents.routes').then(m => m.RGISTERD_ROUTES ) },
  { path: 'all-students', loadChildren: () => import('./pages/all-students/all-students.routes').then(m => m.ALL_STUDENTS_ROUTES ) },
  { path: 'employees', loadChildren: () => import('./pages/employees/registerdStudents.routes').then(m => m.EMPLOYEE_ROUTES ) },
  { path: 'payments', loadChildren: () => import('./pages/payments/payments.routes').then(m => m.PAYMENTS_ROUTES ) },
  { path: 'attendance', loadChildren: () => import('./pages/attendance/attendance.routes').then(m => m.Attendance_ROUTES ) },
  { path: 'student-account/:id', loadChildren: () => import('./pages/student-payment-details/student-payment-details.routes').then(m => m.STUDENT_PAYMENT_DETAILS ) },
  { path: 'student-subscription', loadChildren: () => import('./pages/subscriptions/stubscriptions.routes').then(m => m.SUBSCRIPTIONS ) },
  { path: 'add-student', loadChildren: () => import('./pages/add-student/add-student.routes').then(m => m.ADD_STUDENT ) },
  { path: 'edit-student/:id', loadChildren: () => import('./pages/add-student/add-student.routes').then(m => m.ADD_STUDENT ) },
  { path: 'reports', loadChildren: () => import('./pages/reports/reports.routes').then(m => m.REPORTS_ROUTES ) },
  { path: 'in-active-students', loadChildren: () => import('./pages/in-active-students/in-active-students.routes').then(m => m.IN_Active_Students_ROUTES ) },
  { path: 'students-not-pay', loadChildren: () => import('./pages/students-not-pay/students-not-pay.routes').then(m => m.STUDENTS_NOT_PAY_ROUTES ) },
];

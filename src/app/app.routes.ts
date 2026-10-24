import { Routes } from '@angular/router';

/**
 * `data.title` feeds the layout header; `data.home` keeps the original flag used by the home page.
 * Every feature is lazy-loaded (and preloaded in the background, see app.config.ts).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', data: { home: true, title: 'الرئيسية' }, loadChildren: () => import('./pages/home/home.routes').then(m => m.Home_ROUTES) },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES) },
  { path: 'registerd', data: { title: 'الطلاب النشطين' }, loadChildren: () => import('./pages/registered-students/registerdStudents.routes').then(m => m.RGISTERD_ROUTES) },
  { path: 'all-students', data: { title: 'الطلاب المسجلين' }, loadChildren: () => import('./pages/all-students/all-students.routes').then(m => m.ALL_STUDENTS_ROUTES) },
  { path: 'employees', loadChildren: () => import('./pages/employees/registerdStudents.routes').then(m => m.EMPLOYEE_ROUTES) },
  { path: 'payments', data: { title: 'اليومية بالمقرأة' }, loadChildren: () => import('./pages/payments/payments.routes').then(m => m.PAYMENTS_ROUTES) },
  { path: 'attendance', data: { title: 'الحضور بالمقرأة' }, loadChildren: () => import('./pages/attendance/attendance.routes').then(m => m.Attendance_ROUTES) },
  { path: 'student-account/:id', data: { title: 'حساب الطالب' }, loadChildren: () => import('./pages/student-payment-details/student-payment-details.routes').then(m => m.STUDENT_PAYMENT_DETAILS) },
  { path: 'student-subscription', data: { title: 'الاشتراكات بالمقرأة' }, loadChildren: () => import('./pages/subscriptions/stubscriptions.routes').then(m => m.SUBSCRIPTIONS) },
  { path: 'add-student', data: { title: 'اضافة طالب' }, loadChildren: () => import('./pages/add-student/add-student.routes').then(m => m.ADD_STUDENT) },
  { path: 'edit-student/:id', data: { title: 'تعديل بيانات الطالب' }, loadChildren: () => import('./pages/add-student/add-student.routes').then(m => m.ADD_STUDENT) },
  { path: 'reports', data: { title: 'التقارير بالمقرأة' }, loadChildren: () => import('./pages/reports/reports.routes').then(m => m.REPORTS_ROUTES) },
  { path: 'in-active-students', data: { title: 'الطلاب غير النشطين' }, loadChildren: () => import('./pages/in-active-students/in-active-students.routes').then(m => m.IN_Active_Students_ROUTES) },
  { path: 'students-not-pay', data: { title: 'اشتراكات لم تدفع' }, loadChildren: () => import('./pages/students-not-pay/students-not-pay.routes').then(m => m.STUDENTS_NOT_PAY_ROUTES) },
  { path: 'paid-expenses', data: { title: 'المصروفات المدفوعة' }, loadChildren: () => import('./pages/paid-expenses/paid-expenses.routes').then(m => m.PAID_EXPENSES_ROUTES) },
  { path: 'settings', data: { title: 'الاعدادات' }, loadChildren: () => import('./pages/settings/settings.routes').then(m => m.SETTINGS_ROUTES) },
  { path: '**', redirectTo: 'home' },
];

export interface NavItem {
  label: string;
  /** ant-design icon name. */
  icon: string;
  route?: string;
  children?: NavItem[];
}

/** Sidebar structure as data — add a page here and it shows up in the menu. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', icon: 'home', route: '/home' },
  {
    label: 'الطلاب',
    icon: 'usergroup-add',
    children: [
      { label: 'اضافة طالب', icon: 'user-add', route: '/add-student' },
      { label: 'الطلاب المسجلين', icon: 'team', route: '/all-students' },
      { label: 'الطلاب النشطين', icon: 'usergroup-add', route: '/registerd' },
      { label: 'الطلاب غير النشطين', icon: 'usergroup-delete', route: '/in-active-students' },
    ],
  },
  { label: 'اليومية بالمقرأة', icon: 'dollar', route: '/payments' },
  { label: 'الحضور بالمقرأة', icon: 'audit', route: '/attendance' },
  { label: 'الاشتراكات بالمقرأة', icon: 'credit-card', route: '/student-subscription' },
  { label: 'اشتراكات لم تدفع', icon: 'strikethrough', route: '/students-not-pay' },
  { label: 'المصروفات المدفوعة', icon: 'account-book', route: '/paid-expenses' },
  { label: 'التقارير بالمقرأة', icon: 'pie-chart', route: '/reports' },
  { label: 'الاعدادات', icon: 'setting', route: '/settings' },
];

/** True when `url` is the item's route or a page underneath it (ignores query string). */
export function isRouteActive(url: string, route: string | undefined): boolean {
  if (!route) return false;
  const path = url.split('?')[0];
  if (route === '/home') return path === '/home' || path === '/';
  return path === route || path.startsWith(`${route}/`);
}

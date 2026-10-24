import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { filter, map, startWith } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

interface Crumb {
  url: string;
  label: string;
  /** Segments such as `/student-account` have no page of their own, so they render as plain text. */
  link: boolean;
}

const LABELS: Record<string, string> = {
  '/registerd': 'الطلاب النشطين',
  '/payments': 'اليومية بالمقرأة',
  '/student-subscription': 'الاشتراكات بالمقرأة',
  '/attendance': 'الحضور بالمقرأة',
  '/student-account': 'حساب الطالب',
  '/add-student': 'اضافة طالب',
  '/reports': 'التقارير بالمقرأة',
  '/edit-student': 'تعديل بيانات الطالب',
  '/in-active-students': 'الطلاب غير النشطين',
  '/students-not-pay': 'اشتراكات لم تدفع',
  '/all-students': 'الطلاب المسجلين',
  '/paid-expenses': 'المصروفات المدفوعة',
  '/settings': 'الاعدادات',
};

const NON_LINK = new Set(['/student-account', '/edit-student']);

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .home-link .home-text {
        background: linear-gradient(90deg, var(--app-primary), var(--app-secondary));
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
      }
      .home-link [nz-icon] {
        color: var(--app-primary);
      }
      .home-link:hover {
        filter: brightness(1.2);
      }
    `,
  ],
  template: `
    <nav aria-label="breadcrumb" class="flex flex-wrap items-center gap-2 text-sm text-app-muted">
      <a routerLink="/home" class="home-link flex items-center gap-1">
        <span nz-icon nzType="home" nzTheme="outline"></span>
        <span class="home-text">الرئيسية</span>
      </a>
      @for (crumb of crumbs(); track crumb.url; let last = $last) {
        <span aria-hidden="true" class="opacity-40">/</span>
        @if (crumb.link && !last) {
          <a [routerLink]="crumb.url" class="transition-colors hover:text-app-primary">{{ crumb.label }}</a>
        } @else {
          <span [class]="last ? 'font-semibold text-app-text' : ''" [attr.aria-current]="last ? 'page' : null">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  constructor() {
    // a student's name in the trail may belong to an inactive student, so load the full lookup only then
    effect(() => {
      const segments = this.url().split('?')[0].split('/').filter(Boolean);
      if (segments.some((_, i) => !LABELS[`/${segments.slice(0, i + 1).join('/')}`])) this.api.ensureAllNames();
    });
  }

  readonly crumbs = computed<Crumb[]>(() => {
    const path = this.url().split('?')[0];
    const segments = path.split('/').filter(Boolean);
    return segments.map((_, index) => {
      const url = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        url,
        label: LABELS[url] ?? this.studentName(segments[index]),
        link: !NON_LINK.has(url),
      };
    });
  });

  /** Dynamic segments (`:id`) show the student's name when it is known, else the raw id. */
  private studentName(id: string): string {
    return this.api.allStudentsName().find((s) => s._id === id)?.name ?? id;
  }
}

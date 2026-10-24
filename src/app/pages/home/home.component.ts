import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/services/api.service';
import { toStudentViews } from '../../core/utils/student.mapper';
import { normalizeArabic } from '../../core/utils/text.util';
import { StudentAvatarComponent } from '../../shared/components/student-avatar/student-avatar.component';

const MAX_RESULTS = 8;

interface QuickLink {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink, NzInputModule, NzAutocompleteModule, NzIconModule, StudentAvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly api = inject(ApiService);

  readonly quickLinks: QuickLink[] = [
    { label: 'اضافة طالب', icon: 'user-add', route: '/add-student' },
    { label: 'الطلاب النشطين', icon: 'usergroup-add', route: '/registerd' },
    { label: 'اليومية', icon: 'dollar', route: '/payments' },
    { label: 'الحضور', icon: 'audit', route: '/attendance' },
    { label: 'التقارير', icon: 'pie-chart', route: '/reports' },
  ];

  protected readonly inputValue = signal('');
  private readonly query = signal('');
  private readonly typed$ = new Subject<string>();

  /** View-models are built once per students list (memoised per student), not on every keystroke. */
  private readonly students = computed(() => toStudentViews(this.api.activeStudentsName()));

  protected readonly options = computed(() => {
    const q = normalizeArabic(this.query());
    if (!q) return [];
    return this.students()
      .filter((s) => s.searchKey.includes(q))
      .slice(0, MAX_RESULTS);
  });

  constructor() {
    this.api.ensureActiveNames();
    this.typed$.pipe(debounceTime(250), takeUntilDestroyed()).subscribe((value) => this.query.set(value));
  }

  protected onInput(value: string): void {
    this.inputValue.set(value);
    this.typed$.next(value);
  }
}

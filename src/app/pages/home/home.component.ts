import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/services/api.service';
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
  private readonly typed$ = new Subject<string>();

  /** The first page of matches from the server (name, code or phone): no students list is kept in the browser. */
  protected readonly options = signal<{ id: string; name: string; imagePath: string | null }[]>([]);

  constructor() {
    this.typed$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        // a slower, older answer can never replace a newer one
        switchMap((q) =>
          q
            ? this.api.getStudentOptions({ search: q, status: 'active', limit: MAX_RESULTS }).pipe(catchError(() => of({ data: [] as any[] })))
            : of({ data: [] as any[] })
        ),
        takeUntilDestroyed()
      )
      .subscribe((res) => this.options.set(res.data.map((s) => ({ id: s._id, name: s.name?.trim() || '--', imagePath: s.image || null }))));
  }

  protected onInput(value: string): void {
    this.inputValue.set(value);
    this.typed$.next(value.trim());
  }
}

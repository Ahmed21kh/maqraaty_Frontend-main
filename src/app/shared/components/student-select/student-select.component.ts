import { ChangeDetectionStrategy, Component, forwardRef, inject, input } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LazyFetch, LazySelectComponent } from '../lazy-select/lazy-select.component';

/**
 * Student picker backed by the paginated `GET /students_options` endpoint (see `LazySelectComponent`):
 * pages of students load as you scroll, search runs on the server, and no full list is downloaded.
 *
 *   <app-student-select placeholder="اختر الطالب" formControlName="student" />
 *   <app-student-select scope="" [hiddenIds]="chosenRelatives" ... />   <!-- inactive students too -->
 */
@Component({
  selector: 'app-student-select',
  standalone: true,
  imports: [FormsModule, LazySelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StudentSelectComponent), multi: true }],
  template: `
    <app-lazy-select
      [fetchPage]="fetchPage"
      [fetchByIds]="fetchByIds"
      [placeholder]="placeholder()"
      [size]="size()"
      [status]="status()"
      [ngModel]="value"
      (ngModelChange)="forward($event)"
    />
  `,
})
export class StudentSelectComponent {
  private readonly api = inject(ApiService);

  readonly placeholder = input('اختر اسم الطالب');
  readonly size = input<'large' | 'default' | 'small'>('default');
  readonly status = input<'' | 'error' | 'warning'>('');
  /** `active` (default) or `in_active`; empty for every student. */
  readonly scope = input<'active' | 'in_active' | ''>('active');
  /** Ids to leave out of the list (e.g. relatives already chosen, the student being edited). */
  readonly hiddenIds = input<readonly (string | null)[] | null | undefined>([]);

  protected value: string | null = null;
  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly fetchPage: LazyFetch = (page, search) =>
    this.api
      .getStudentOptions({
        page,
        search,
        status: this.scope(),
        exclude: (this.hiddenIds() ?? []).filter((id): id is string => !!id),
      })
      .pipe(map((res) => ({ data: res.data, hasMore: res.hasMore })));

  protected readonly fetchByIds = (ids: string[]) => this.api.getStudentOptions({ ids }).pipe(map((res) => res.data));

  protected forward(v: string | null): void {
    this.value = v;
    this.onChange(v);
    this.onTouched();
  }
  writeValue(v: string | null): void {
    this.value = v ?? null;
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}

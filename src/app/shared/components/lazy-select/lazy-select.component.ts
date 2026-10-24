import { ChangeDetectionStrategy, Component, computed, DestroyRef, forwardRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { catchError, debounceTime, map, Observable, of, Subject, switchMap } from 'rxjs';

export interface LazyOption {
  _id: string;
  name?: string | null;
  code?: number | string | null;
}

export interface LazyPage<T extends LazyOption = LazyOption> {
  data: T[];
  hasMore: boolean;
}

/** Loads one page of options for the given search text (page numbers start at 1). */
export type LazyFetch<T extends LazyOption = LazyOption> = (page: number, search: string) => Observable<LazyPage<T>>;

/**
 * Select for long lists: it never downloads the whole list. Options come from the server one page at a time
 * (the next page loads when the dropdown is scrolled to its end), and typing searches on the server too.
 * A saved value is labelled through `fetchByIds`, so it shows its name even when it is not on the loaded page.
 * Works with `formControlName`, `formControl` and `ngModel`.
 *
 *   <app-lazy-select [fetchPage]="fetch" [fetchByIds]="byIds" placeholder="اختر" formControlName="x" />
 */
@Component({
  selector: 'app-lazy-select',
  standalone: true,
  imports: [FormsModule, NzSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LazySelectComponent), multi: true }],
  template: `
    <nz-select
      class="w-full"
      dir="rtl"
      nzShowSearch
      nzAllowClear
      nzServerSearch
      [nzSize]="size()"
      [nzStatus]="status()"
      [nzPlaceHolder]="placeholder()"
      [nzDropdownStyle]="{ direction: 'rtl' }"
      [nzDisabled]="disabled()"
      [nzLoading]="loading()"
      [nzNotFoundContent]="loading() ? 'جاري التحميل...' : 'لا توجد نتائج'"
      [ngModel]="value()"
      (ngModelChange)="pick($event)"
      (nzOnSearch)="onSearch($event)"
      (nzScrollToBottom)="loadMore()"
      (nzOpenChange)="onOpen($event)"
      (nzBlur)="touched()"
    >
      @for (o of options(); track o._id) {
        <nz-option [nzValue]="o._id" [nzLabel]="label(o)" />
      }
    </nz-select>
  `,
})
export class LazySelectComponent implements ControlValueAccessor {
  readonly fetchPage = input.required<LazyFetch>();
  /** Resolves ids to options so a saved selection can be shown by name. */
  readonly fetchByIds = input<((ids: string[]) => Observable<LazyOption[]>) | null>(null);
  readonly placeholder = input('اختر');
  readonly size = input<'large' | 'default' | 'small'>('default');
  readonly status = input<'' | 'error' | 'warning'>('');
  /** Text of an option. Empty names show as "--". */
  readonly labelFn = input<(o: LazyOption) => string>((o) => o.name?.trim() || '--');

  protected readonly value = signal<string | null>(null);
  protected readonly disabled = signal(false);
  protected readonly loading = signal(false);

  private readonly items = signal<LazyOption[]>([]);
  private readonly selected = signal<LazyOption | null>(null);
  private page = 0;
  private hasMore = true;
  private search = '';
  private readonly request$ = new Subject<{ page: number; reset: boolean }>();
  private readonly typed$ = new Subject<string>();

  /** Loaded options, plus the saved selection when it is not part of them. */
  protected readonly options = computed(() => {
    const list = this.items();
    const sel = this.selected();
    return sel && !list.some((o) => o._id === sel._id) ? [sel, ...list] : list;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    // switchMap: a slower, older response can never overwrite a newer one
    this.request$
      .pipe(
        switchMap((req) => {
          this.loading.set(true);
          return this.fetchPage()(req.page, this.search).pipe(
            map((res) => ({ req, res })),
            catchError(() => of({ req, res: null }))
          );
        }),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(({ req, res }) => {
        this.loading.set(false);
        if (!res) return;
        this.page = req.page;
        this.hasMore = res.hasMore;
        this.items.update((cur) => (req.reset ? res.data : [...cur, ...res.data.filter((d) => !cur.some((c) => c._id === d._id))]));
      });

    this.typed$.pipe(debounceTime(300), takeUntilDestroyed(destroyRef)).subscribe((q) => {
      this.search = q;
      this.request$.next({ page: 1, reset: true });
    });
  }

  protected label(o: LazyOption): string {
    return this.labelFn()(o);
  }

  private isOpen = false;

  protected onOpen(open: boolean): void {
    const was = this.isOpen;
    this.isOpen = open;
    if (!open || was) return; // nzOpenChange can fire twice for one opening
    // always start from the first page so the list matches the current exclusions / search
    this.search = '';
    this.request$.next({ page: 1, reset: true });
  }

  protected onSearch(q: string): void {
    const text = (q ?? '').trim();
    if (text === this.search) return; // the select reports '' when it opens; nothing changed
    this.typed$.next(text);
  }

  protected loadMore(): void {
    if (this.loading() || !this.hasMore) return;
    this.request$.next({ page: this.page + 1, reset: false });
  }

  // ---- ControlValueAccessor
  private onChange: (v: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected pick(v: string | null): void {
    const next = v ?? null;
    this.value.set(next);
    this.selected.set(next ? (this.items().find((o) => o._id === next) ?? this.selected()) : null);
    this.onChange(next);
  }

  protected touched(): void {
    this.onTouched();
  }

  writeValue(v: string | null): void {
    const id = v ?? null;
    this.value.set(id);
    if (!id) {
      this.selected.set(null);
      return;
    }
    if (this.items().some((o) => o._id === id) || this.selected()?._id === id) return;
    this.fetchByIds()?.([id]).subscribe((list) => this.selected.set(list.find((o) => o._id === id) ?? null));
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabled.set(d);
  }
}

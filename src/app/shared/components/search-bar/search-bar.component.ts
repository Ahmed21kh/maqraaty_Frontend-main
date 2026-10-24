import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

/** Debounced search box. Emits the trimmed text via `(search)` once typing pauses. */
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [NzInputModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-input-group [nzSuffix]="value() ? clear : suffix" [nzSize]="size()" style="border-radius: 15px">
      <input
        nz-input
        type="search"
        [placeholder]="placeholder()"
        [value]="value()"
        [attr.aria-label]="placeholder()"
        (input)="onInput($any($event.target).value)"
        (keydown.enter)="flush()"
      />
    </nz-input-group>
    <ng-template #suffix>
      <span nz-icon [nzType]="loading() ? 'loading' : 'search'" class="text-app-muted"></span>
    </ng-template>
    <ng-template #clear>
      <button type="button" class="cursor-pointer border-0 bg-transparent text-app-muted hover:text-app-text" aria-label="مسح" (click)="reset()">
        <span nz-icon nzType="close-circle" nzTheme="fill"></span>
      </button>
    </ng-template>
  `,
})
export class SearchBarComponent {
  readonly placeholder = input('بحث...');
  readonly debounce = input(300);
  readonly loading = input(false);
  readonly size = input<'small' | 'default' | 'large'>('large');
  readonly search = output<string>();

  protected readonly value = signal('');
  private readonly input$ = new Subject<string>();

  constructor() {
    this.input$
      .pipe(debounceTime(this.debounce()), distinctUntilChanged(), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((text) => this.search.emit(text));
  }

  protected onInput(text: string): void {
    this.value.set(text);
    this.input$.next(text.trim());
  }

  protected flush(): void {
    this.search.emit(this.value().trim());
  }

  protected reset(): void {
    this.value.set('');
    this.search.emit('');
  }
}

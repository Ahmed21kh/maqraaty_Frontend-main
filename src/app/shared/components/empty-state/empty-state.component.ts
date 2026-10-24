import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-app-surface-2 text-3xl text-app-muted">
        <span nz-icon [nzType]="icon()" nzTheme="outline"></span>
      </span>
      <p class="text-base font-semibold text-app-text">{{ title() }}</p>
      @if (description()) {
        <p class="max-w-sm text-sm text-app-muted">{{ description() }}</p>
      }
      <div class="mt-2"><ng-content /></div>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('لا توجد بيانات');
  readonly description = input('');
  readonly icon = input('inbox');
}

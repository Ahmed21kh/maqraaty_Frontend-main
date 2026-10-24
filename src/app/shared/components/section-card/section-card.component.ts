import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

/** Titled surface with an actions slot and a built-in loading skeleton. */
@Component({
  selector: 'app-section-card',
  standalone: true,
  imports: [NzSkeletonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="app-card overflow-hidden">
      @if (title() || subtitle()) {
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-app-border px-5 py-4">
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-app-text">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="text-sm text-app-muted">{{ subtitle() }}</p>
            }
          </div>
          <div class="flex flex-wrap items-center gap-2"><ng-content select="[actions]" /></div>
        </div>
      }
      <div [class]="padded() ? 'p-5' : ''">
        @if (loading()) {
          <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 4 }" />
        } @else {
          <ng-content />
        }
      </div>
    </section>
  `,
})
export class SectionCardComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly loading = input(false);
  readonly padded = input(true);
}

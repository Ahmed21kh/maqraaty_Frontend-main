import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Title card at the top of a page: icon, title, subtitle and an actions slot.
 * (The breadcrumb lives in the layout header.)
 *
 *   <app-page-header subtitle="..." icon="team">
 *     <button actions nz-button>…</button>
 *   </app-page-header>
 *
 * The title defaults to the route's `data.title`, so pages rarely need to pass it.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: [
    `
      // phones: projected actions (stat cards, buttons) take the full row instead of keeping their desktop min-widths
      @media (max-width: 639px) {
        // only stat cards stretch; buttons and other controls keep their natural width
        :host ::ng-deep .actions-slot > app-stat-card,
        :host ::ng-deep .actions-slot > :has(app-stat-card),
        :host ::ng-deep .actions-slot > :has(app-stat-card) > app-stat-card {
          width: 100% !important;
          min-width: 0 !important;
        }
        :host ::ng-deep .actions-slot {
          justify-items: start;
        }
      }
    `,
  ],
  template: `
    <header class="app-card mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
      <div class="flex min-w-0 items-center gap-4">
        @if (icon()) {
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-app bg-app-primary-soft text-2xl text-app-primary">
            <span nz-icon [nzType]="icon()!" nzTheme="outline"></span>
          </span>
        }
        <div class="min-w-0">
          @if (resolvedTitle) {
            <h1 class="truncate text-2xl font-bold leading-tight text-app-text">{{ resolvedTitle }}</h1>
          }
          @if (subtitle()) {
            <p class="mt-0.5 text-sm text-app-muted">{{ subtitle() }}</p>
          }
        </div>
      </div>
      <div class="actions-slot flex flex-wrap items-stretch gap-3 sm:grid sm:w-full sm:grid-cols-1">
        <ng-content select="[actions]" />
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  private readonly route = inject(ActivatedRoute);

  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  /** ant-design icon name, e.g. `team`. */
  readonly icon = input<string | null>(null);

  get resolvedTitle(): string {
    return this.title() || (this.route.snapshot.data['title'] as string | undefined) || '';
  }
}

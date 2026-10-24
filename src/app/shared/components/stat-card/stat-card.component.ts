import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { TONE_CLASSES, Tone } from '../../../../theme/tokens';

/**
 * KPI tile: icon bubble, label, big value and an optional hint line.
 * Give it a `link` (and optionally `queryParams`) and the whole tile becomes a navigation link —
 * visually unchanged, it only gets the pointer cursor.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NzIconModule, NzSkeletonModule, RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ng-template #card>
      <div class="app-card flex min-h-full items-center gap-4 p-5 transition-shadow hover:shadow-app-hover">
        @if (icon()) {
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-app text-2xl" [class]="toneClasses().soft">
            <span nz-icon [nzType]="icon()!" nzTheme="outline"></span>
          </span>
        }
        <div class="min-w-0 flex-1">
          <p class="text-sm text-app-muted">{{ label() }}</p>
          @if (loading()) {
            <nz-skeleton [nzActive]="true" [nzParagraph]="false" [nzTitle]="{ width: '60%' }" />
          } @else {
            <p class="truncate text-2xl font-bold leading-snug text-app-text">
              {{ value() ?? 0 }}@if (suffix()) {<span class="ms-1 text-base font-medium text-app-muted">{{ suffix() }}</span>}
            </p>
          }
          @if (hint()) {
            <p class="mt-0.5 text-xs" [class]="toneClasses().text">{{ hint() }}</p>
          }
        </div>
        <ng-content />
      </div>
    </ng-template>

    @if (link()) {
      <a
        class="block min-h-full cursor-pointer no-underline"
        [routerLink]="link()"
        [queryParams]="queryParams()"
        [attr.aria-label]="'الانتقال الى: ' + label()"
      >
        <ng-container *ngTemplateOutlet="card" />
      </a>
    } @else {
      <ng-container *ngTemplateOutlet="card" />
    }
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number | null>(null);
  readonly suffix = input<string>('');
  readonly hint = input<string>('');
  readonly icon = input<string | null>(null);
  readonly tone = input<Tone>('primary');
  readonly loading = input(false);
  /** Router link; when set the whole card is clickable. */
  readonly link = input<string | unknown[] | null>(null);
  readonly queryParams = input<Params | null>(null);

  protected readonly toneClasses = computed(() => TONE_CLASSES[this.tone()]);
}

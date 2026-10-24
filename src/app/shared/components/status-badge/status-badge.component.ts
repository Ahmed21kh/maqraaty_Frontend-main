import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TONE_CLASSES, Tone } from '../../../../theme/tokens';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .badge {
        min-width: 86px;
        border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
        box-shadow: 0 1px 6px color-mix(in srgb, currentColor 14%, transparent);
      }
      .dot {
        box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 22%, transparent);
      }
    `,
  ],
  template: `
    <span class="badge inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-1 text-[13px] font-semibold leading-6" [class]="classes()">
      @if (dot()) {
        <span class="dot h-2 w-2 rounded-full bg-current"></span>
      }
      <ng-content />
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly tone = input<Tone>('neutral');
  readonly dot = input(true);
  protected readonly classes = computed(() => TONE_CLASSES[this.tone()].soft);
}

import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Month chooser: a swipeable row of "شهر N" chips with arrow buttons. Chips keep a readable width at
 * every screen size (the row scrolls instead of squeezing), and the selected month is kept in view.
 *
 *   <app-month-carousel [months]="months" [active]="activeMonth" (selected)="onMonth($event)" />
 */
@Component({
  selector: 'app-month-carousel',
  standalone: true,
  imports: [NzButtonModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: [
    `
      .wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .track {
        display: flex;
        flex: 1;
        gap: 8px;
        padding: 4px 2px;
        overflow-x: auto;
        scroll-snap-type: x proximity;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      .track::-webkit-scrollbar {
        display: none;
      }
      .chip {
        flex: 1 0 84px;
        min-width: 84px;
        scroll-snap-align: center;
        border-radius: 10px;
      }
      .arrow {
        display: flex;
        width: 32px;
        height: 32px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        padding: 0;
        cursor: pointer;
        color: var(--app-text);
        background: var(--app-surface-2);
        border: 1px solid var(--app-border);
        border-radius: 50%;
        transition: opacity 0.15s, transform 0.15s;
      }
      .arrow:hover:not(:disabled) {
        transform: scale(1.08);
      }
      .arrow:disabled {
        opacity: 0.35;
        cursor: default;
      }
    `,
  ],
  template: `
    <div class="wrap" dir="rtl">
      <button type="button" class="arrow" aria-label="السابق" [disabled]="!canRight()" (click)="scroll(1)">
        <span nz-icon nzType="right" nzTheme="outline"></span>
      </button>
      <div #track class="track" (scroll)="measure()">
        @for (m of months() ?? []; track m) {
          <button
            nz-button
            type="button"
            class="chip"
            [attr.data-month]="m"
            [nzType]="active() === m ? 'primary' : 'default'"
            (click)="selected.emit(m)"
          >
            شهر {{ m }}
          </button>
        }
      </div>
      <button type="button" class="arrow" aria-label="التالي" [disabled]="!canLeft()" (click)="scroll(-1)">
        <span nz-icon nzType="left" nzTheme="outline"></span>
      </button>
    </div>
  `,
})
export class MonthCarouselComponent {
  readonly months = input<number[] | null | undefined>([]);
  readonly active = input<number | null>(null);
  readonly selected = output<number>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly canLeft = signal(false);
  protected readonly canRight = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.track().nativeElement;
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
      this.reveal(false);
    });
    // keep the selected month in view when it changes
    effect(() => {
      this.active();
      this.months();
      queueMicrotask(() => this.reveal(true));
    });
  }

  protected scroll(direction: 1 | -1): void {
    const el = this.track().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' });
  }

  protected measure(): void {
    const el = this.track().nativeElement;
    // RTL: scrollLeft runs from 0 (start, right edge) down to a negative maximum
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    const rtl = getComputedStyle(el).direction === 'rtl';
    const atStart = pos <= 1;
    const atEnd = pos >= max - 1;
    // "right" arrow = towards the right edge
    this.canRight.set(max > 1 && (rtl ? !atStart : !atEnd));
    this.canLeft.set(max > 1 && (rtl ? !atEnd : !atStart));
  }

  private reveal(smooth: boolean): void {
    const el = this.track()?.nativeElement;
    const chip = el?.querySelector<HTMLElement>(`[data-month="${this.active()}"]`);
    if (!el || !chip) return;
    const left = chip.offsetLeft - el.offsetLeft - (el.clientWidth - chip.clientWidth) / 2;
    el.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    this.measure();
  }
}

import { inject, Injectable, NgZone } from '@angular/core';

const SCROLLERS = '.ant-table-content, .ant-table-body';

/**
 * Marks a table's scroll container with `scroll-end` once it has been scrolled all the way to the edge where the pinned
 * action column sits (or when nothing scrolls at all). The stylesheet only draws the pinned column's shadow while the
 * class is absent, so the shadow disappears exactly when the column is back in its natural place.
 *
 * One passive capture listener covers every table; observers pick up tables as pages create them. It all runs outside
 * Angular's zone, so scrolling never triggers change detection.
 */
@Injectable({ providedIn: 'root' })
export class TableScrollService {
  private readonly zone = inject(NgZone);
  private started = false;

  start(): void {
    if (this.started || typeof document === 'undefined') return;
    this.started = true;

    this.zone.runOutsideAngular(() => {
      const update = (el: Element) => {
        const box = el as HTMLElement;
        const max = box.scrollWidth - box.clientWidth;
        // right-to-left tables scroll with negative offsets; either way the edge is |scrollLeft| === max
        box.classList.toggle('scroll-end', max <= 1 || Math.abs(box.scrollLeft) >= max - 1);
      };

      document.addEventListener(
        'scroll',
        (e) => {
          const t = e.target;
          if (t instanceof HTMLElement && t.matches(SCROLLERS)) update(t);
        },
        { capture: true, passive: true }
      );

      const sizes = new ResizeObserver((entries) => entries.forEach((entry) => update(entry.target.closest(SCROLLERS) ?? entry.target)));
      const seen = new WeakSet<Element>();
      let queued = false;
      const scan = () => {
        queued = false;
        document.querySelectorAll(SCROLLERS).forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          sizes.observe(el);
          if (el.firstElementChild) sizes.observe(el.firstElementChild); // the table itself grows with its columns
          update(el);
        });
      };
      new MutationObserver(() => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(scan);
        }
      }).observe(document.body, { childList: true, subtree: true });
      scan();
    });
  }
}

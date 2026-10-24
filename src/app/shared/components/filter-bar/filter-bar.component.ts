import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LayoutStateService } from '../../../layout/layout-state.service';

/**
 * Search / filter row above a table. On desktop the projected controls sit inline in a row;
 * on phones they move into a bottom drawer opened from a single "search & filter" button, so the
 * table is not pushed off the screen by a stack of inputs.
 *
 *   <app-filter-bar> <nz-input-group>…</nz-input-group> … </app-filter-bar>
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [NgTemplateOutlet, NzButtonModule, NzDrawerModule, NzIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <ng-template #controls><ng-content /></ng-template>

    @if (layout.isMobile()) {
      <button type="button" nz-button nzSize="large" class="filter-trigger" (click)="open.set(true)">
        <span nz-icon nzType="filter" nzTheme="outline"></span>{{ title() }}
      </button>
      <nz-drawer
        [nzVisible]="open()"
        nzPlacement="bottom"
        [nzTitle]="title()"
        nzHeight="auto"
        [nzClosable]="false"
        nzWrapClassName="filter-drawer"
        [nzBodyStyle]="{ 'padding-bottom': '8px' }"
        (nzOnClose)="open.set(false)"
      >
        <ng-container *nzDrawerContent>
          <div dir="rtl" class="flex flex-col gap-3">
            <ng-container *ngTemplateOutlet="controls" />
            <button type="button" nz-button nzType="primary" nzSize="large" nzBlock (click)="open.set(false)">عرض النتائج</button>
          </div>
        </ng-container>
      </nz-drawer>
    } @else {
      <div style="margin-block: 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px">
        <ng-container *ngTemplateOutlet="controls" />
      </div>
    }
  `,
  styles: [
    `
      .filter-trigger {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-block: 16px;
        border-radius: 15px;
      }
    `,
  ],
})
export class FilterBarComponent {
  protected readonly layout = inject(LayoutStateService);
  readonly title = input('بحث وفلترة');
  protected readonly open = signal(false);
}

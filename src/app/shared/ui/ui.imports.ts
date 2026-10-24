import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';

/**
 * The ng-zorro / forms building blocks almost every page needs.
 * `imports: [...UI_FORM_IMPORTS]` replaces the 20-line import list copy-pasted across pages.
 */
export const UI_BASE_IMPORTS = [
  CommonModule,
  NzButtonModule,
  NzCardModule,
  NzDividerModule,
  NzGridModule,
  NzIconModule,
  NzSpinModule,
  NzTagModule,
  NzToolTipModule,
] as const;

export const UI_FORM_IMPORTS = [
  ...UI_BASE_IMPORTS,
  FormsModule,
  ReactiveFormsModule,
  NzDatePickerModule,
  NzFormModule,
  NzInputModule,
  NzInputNumberModule,
  NzRadioModule,
  NzSelectModule,
  NzUploadModule,
] as const;

export const UI_TABLE_IMPORTS = [
  ...UI_BASE_IMPORTS,
  NzImageModule,
  NzModalModule,
  NzPaginationModule,
  NzTableModule,
] as const;

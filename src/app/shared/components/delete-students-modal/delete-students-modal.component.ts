import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { NZ_MODAL_DATA, NzModalRef, NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { EmptyPipe } from '../../pipes/empty.pipe';
import { OrderByPipe } from '../../pipes/order-by/order-by.pipe';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-delete-students-modal',
  standalone: true,
  imports: [
    NzGridModule,
     NzTableModule,
     NzButtonModule,
     NzIconModule,
     NzInputModule,
     NzModalModule,
     NzFormModule,
     FormsModule,
     ReactiveFormsModule,
     NzUploadModule,
     NzImageModule,
     NzPaginationModule,
     NzDatePickerModule,
     NzInputNumberModule,
     NzRadioModule,
     NzSelectModule,
     CommonModule,
     NzDividerModule,
     EmptyPipe,
     OrderByPipe,
     NzToolTipModule,
     NzSpinModule,
     NzCardModule,
     NzTagModule
],
  templateUrl: './delete-students-modal.component.html',
  styleUrl: './delete-students-modal.component.scss'
})
export class DeleteStudentsModalComponent implements OnInit{
  loadingDelete:boolean = false;
  studentId:string = '';
  readonly #modal = inject(NzModalRef);
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: ApiService,
  ) {}
  ngOnInit(): void {
    this.studentId = this.nzModalData.studentId;
  }

  handleDelete_student() {
    this.loadingDelete = true;
    this.appService
      .delete_student(this.studentId)
      .subscribe({
        next: (response) => {
          this.msg.success('تم الحذف بنجاح');
          this.loadingDelete = false;
          this.destroyModal(true);
        },
        error: (err) => {
          this.msg.error(err.message);
          this.loadingDelete = false;
        },
      });
    }

    handleCancelConfirmDelete(): void {
      this.destroyModal()
      this.studentId = '';
    }

    destroyModal(data?: any): void {
      this.#modal.destroy(data);
    }
}

import { StudentSelectComponent } from '../student-select/student-select.component';
import { CommonModule } from '@angular/common';
import { ImageOnlyUploadDirective } from '../../directives/image-only-upload.directive';
import { Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { EmptyPipe } from '../../pipes/empty.pipe';
import { OrderByPipe } from '../../pipes/order-by/order-by.pipe';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
import { distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { Student_Names } from '../../../core/models/app.model';


@Component({
  selector: 'app-edit-students-modal',
  standalone: true,
  imports: [
    StudentSelectComponent,
    ImageOnlyUploadDirective,
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
     NzTagModule,
     NzIconModule
],
  templateUrl: './edit-students-modal.component.html',
  styleUrl: './edit-students-modal.component.scss'
})

export class EditStudentsModalComponent implements OnInit, OnDestroy {
  isVisible = false;
  isEdit = false;
  readonly destroy$ = new Subject<void>();
  loadingAdd: boolean = false;
  loadingAEdit: boolean = false;
  url: string = environment.apiUrl
  studentsName = (this.appService.ensureAllNames(), this.appService.allStudentsName);
  studentsNameOptions = signal<Student_Names[]>([]);
  selectedStudents = signal<Student_Names[]>([]);
  studentId:string = '';
  readonly #modal = inject(NzModalRef, { optional: true });
  readonly serv = inject(ApiService);
  readonly nzModalData: any = inject(NZ_MODAL_DATA, { optional: true });

  /**
   * Embedded mode: the form is shown inside another modal (the student details view) instead of
   * its own dialog, so it brings its own save / cancel buttons and reports back through outputs.
   */
  @Input() embedded = false;
  @Input() student: any = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @ViewChild('footer') footer!: TemplateRef<any>;
  constructor(
    readonly fb: FormBuilder,
    readonly msg: NzMessageService,
    readonly appService: ApiService
  ) {}


  myForm = this.fb.group({
    name: ['', [ Validators.minLength(4)]],
    phone_1: this.fb.array([
     new FormControl('',[Validators.min(11),Validators.pattern(/^\d{11}$/)])
    ]),
    phone_2: this.fb.array([
         new FormControl('',[Validators.min(11),Validators.pattern(/^\d{11}$/)])
    ]),
    phone_3: this.fb.array([
         new FormControl('',[Validators.min(11),Validators.pattern(/^\d{11}$/)])
    ]),
    age:[null],
    study_year:[''],
    has_relative:[''],
    relative:this.fb.array([
      new FormControl('')
    ]),
    is_payment:[''],
    is_Azhar:[''],
    landline: ['', [ Validators.min(7)]],
    address: [''],
    date:[new Date() ],
    image: [''],
    notes: [''],
    amount:[null]
  });

  passForm = this.fb.group({
    password:[null,[Validators.required,Validators.pattern("3333")]]
  });

  paymentForm = this.fb.group({
    amount:[0]
  })
  /** Not offered as a relative: the student being edited and everyone already chosen. */
  relativeExclusions(): string[] {
    return [this.studentId, ...this.arr_relative.value].filter((id): id is string => !!id);
  }

  get arr_phone_1() {
    return this.myForm.get('phone_1') as FormArray;
  }
  get arr_phone_2() {
    return this.myForm.get('phone_2') as FormArray;
  }
  get arr_phone_3() {
    return this.myForm.get('phone_3') as FormArray;
  }
  get arr_relative() {
    return this.myForm.get('relative') as FormArray;
  }
  get f() {
    return this.myForm.controls;
  }
  get pf() {
    return this.paymentForm.controls;
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: Event) {
    const target = event.target as HTMLElement;
   if (target.tagName === 'TEXTAREA') return;
   if (target.tagName === 'INPUT' && target.closest('nz-select')) return;

   const isSelectOpen = document.querySelector('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
   if (isSelectOpen) return;

    this.handleSubmitEdit();
  }

  #rebuildArray(fieldName: string, values: any[]) {
    const arr = this.myForm.get(fieldName) as FormArray;
    arr.clear(); // remove all existing controls

    if (!values || values.length === 0) {
      arr.push(new FormControl('')); // always keep at least one
      return;
    }

    values.forEach(() => {
      if (fieldName === 'relative') {
        arr.push(new FormControl(''));
      } else {
        arr.push(new FormControl('', [Validators.pattern(/^\d{11}$/)]));
      }
    });
  }

  ngOnInit(): void {
    const data = this.nzModalData?.studentData ?? this.student;
    this.studentId = (this.nzModalData?.studentId ?? this.student?._id) as string;

    // ── Extract only IDs from relative objects ──
    const relativeIds: string[] = (data.relative || [])
      .map((r: any) => (typeof r === 'string' ? r : r?._id))
      .filter((id: any) => !!id);
    const selectedIds = new Set(
      this.arr_relative.value.filter((id: string) => id && id !== '')
    );
    const students = this.studentsName().filter(
      (s): s is Student_Names =>
        s._id != null &&
        s._id !== this.studentId
    );
    this.selectedStudents.set([...students.filter(s=>!selectedIds.has(s._id))])
    this.studentsNameOptions.set([...students]);


    this.#rebuildArray('phone_1', data.phone_1);
    this.#rebuildArray('phone_2', data.phone_2);
    this.#rebuildArray('phone_3', data.phone_3);
    this.#rebuildArray('relative', relativeIds);

    this.myForm.setValue({
      name: data.name,
      phone_1: data.phone_1,
      phone_2: data.phone_2,
      phone_3: data.phone_3,
      age: data.age,
      study_year: data.study_year,
      has_relative: data.has_relative,
      relative: relativeIds, // ── strings only, not objects ──
      is_payment: data.is_payment,
      is_Azhar: data.is_Azhar,
      landline: data.landline,
      address: data.address,
      image: data.image,
      notes: data.notes,
      date: data.date,
      amount: data.amount,
    });

    this.myForm.get('relative')!.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    ).subscribe((relativeIds) => {
      const selectedIds = new Set(relativeIds.filter(id => id && id !== ''));

      const newArr = this.studentsName().filter(
        (s): s is Student_Names =>
          s._id != null &&
          s._id !== this.studentId
      );
      this.selectedStudents.set([...students.filter(s=>!selectedIds.has(s._id))])

      this.studentsNameOptions.set(newArr);
    });
  }

  handleChange({ file, fileList }: NzUploadChangeParam): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    if (status === 'done') {
      this.msg.success('تم رفع الصورة بنجاح');
      this.myForm.setValue({
        image: file?.response?.path || null,
        name: this.myForm.value.name || null,
        phone_1: this.myForm.value.phone_1 || [''],
        phone_2: this.myForm.value.phone_2 || [''],
        phone_3: this.myForm.value.phone_3 || [''],
        landline: this.myForm.value.landline || null,
        address: this.myForm.value.address || null,
        notes: this.myForm.value.notes || null,
        age: this.myForm.value.age || null,
        study_year: this.myForm.value.study_year || null,
        has_relative: this.myForm.value.has_relative || null,
        relative: this.myForm.value.relative || [],
        is_payment: this.myForm.value.is_payment || '',
        is_Azhar: this.myForm.value.is_Azhar || '',
        date: new Date(),
        amount:this.myForm.value.amount || null
      });
    } else if (status === 'error') {
      this.msg.error('فشل رفع الصورة');
    }
  }

  resetData() {
    this.myForm.reset({
      name: '',
      phone_1: [],
      phone_2: [],
      phone_3: [],
      age:null,
      study_year:'',
      has_relative:'',
      relative:[],
      is_payment:'',
      is_Azhar:'',
      landline: '',
      address: '',
      image: '',
      notes: '',
      date:new Date(),
      amount:null
    });
    this.paymentForm.reset({
      amount:0
    })
    this.arr_phone_1.reset([''])
    this.arr_phone_2.reset([''])
    this.arr_phone_3.reset([''])
    this.arr_relative.reset([''])
    this.passForm.reset({
      password:null
    })
    // this.arr_phone_1.push(new FormControl(''))
    // this.arr_phone_3.push(new FormControl(''))
    // this.arr_phone_3.push(new FormControl(''))
  }

  handleOk(): void {
    if (this.myForm.value.has_relative == "نعم") {

      this.arr_relative.controls.forEach(data => data.markAllAsTouched())
    }else {
      this.arr_relative.controls.forEach(data => data.clearValidators())

    }

    if (this.myForm.valid) {
      this.loadingAdd = true;
      this.appService.addStudent(this.myForm.value).subscribe({
        next: async(res) => {
        this.msg.success('تم الاضافة بنجاح');
        // this.handleAddAttendance(res.data._id)
        // this.getDataOfStudents().then(() => {
        //   this.loadingAdd = false;
        //   this.isVisible = false;
        //   this.resetData();
        // });
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
    } else {
      this.validate()
      this.myForm.controls.image.markAsTouched();
    }
  }

  validate(){
    this.myForm.controls.name.markAsTouched();
    this.myForm.controls.landline.markAsTouched();
    this.myForm.controls.address.markAsTouched();
    this.myForm.controls.age.markAsTouched();
    this.myForm.controls.has_relative.markAsTouched();
    this.myForm.controls.is_Azhar.markAsTouched();
    this.myForm.controls.is_payment.markAsTouched();
    this.myForm.controls.date.markAsTouched();
    this.myForm.controls.relative.markAsTouched();
    this.myForm.controls.study_year.markAsTouched();
    this.paymentForm.controls.amount.markAllAsTouched();
    this.arr_phone_1.controls.forEach(data => data.markAllAsTouched())
    this.arr_phone_2.controls.forEach(data => data.markAllAsTouched())
    this.arr_phone_3.controls.forEach(data => data.markAllAsTouched())

  }

  handleAdd(title:string) {
    const formControl = new FormControl('',[Validators.min(11),Validators.pattern(/^\d{11}$/)])
    const formControl2 = new FormControl(null)
    if (title == "phone_1") {
    this.arr_phone_1.push(formControl)
    }else if (title == "phone_2") {
      this.arr_phone_2.push(formControl)
    }else if (title == "phone_3") {
      this.arr_phone_3.push(formControl)
    }else if (title == "relative") {
     // ── Only exclude non-empty selected IDs ──

  const newArr = this.studentsName().filter(
    (s): s is Student_Names =>
      s._id != null &&
      s._id !== this.studentId
  );
  this.studentsNameOptions.set(newArr);
  this.arr_relative.push(formControl2);
    }
  }

  handleRemove(index:number,title:string){
    if (title == "phone_1") {
      this.arr_phone_1.removeAt(index)
      }else if (title == "phone_2") {
        this.arr_phone_2.removeAt(index)
      }else if (title == "phone_3") {
        this.arr_phone_3.removeAt(index)

      }else if (title == "relative") {
        this.arr_relative.removeAt(index)
      }
  }

  handleCancel(): void {
    if (this.embedded) {
      this.cancelled.emit();
      return;
    }
    this.destroyModal();
    this.loadingAdd = false;
    this.loadingAEdit = false;
    this.resetData();
    setTimeout(() => {
      this.isEdit = false;
    }, 100);
  }

  handleSubmitEdit() {
    if (this.myForm.value.has_relative == "نعم") {

      this.arr_relative.controls.forEach(data => data.markAllAsTouched())
    }else {
      this.arr_relative.controls.forEach(data => data.clearValidators())

    }
    if (this.myForm.valid) {

      this.loadingAEdit = true;
      this.appService
        .updateStudent(this.studentId, this.myForm.value)
        .pipe(
          map(() => {
            // this.msg.loading('loading...')
          })
        )
        .subscribe({
          next: (data) => {

            this.msg.success('تم التحديث بنجاح');
            this.loadingAEdit = false;
            this.destroyModal(true);
            this.resetData();
          },
          error: (err) => {
            this.msg.error(err.message);
            this.loadingAEdit = false;
          },
        });
    } else {
      this.validate()
    }
  }

  disabledOption(item:any):boolean {
     return this.arr_relative.value?.includes(item?._id)
  }

  destroyModal(data?: any): void {
    if (this.embedded) {
      if (data) this.saved.emit();
      return;
    }
    this.#modal?.destroy(data);
  }

  onDropdownOpen(isOpen: boolean): void {
    const modalBody = document.querySelector('.ant-modal-body') as HTMLElement;
    if (modalBody) {
      modalBody.style.overflow = isOpen ? 'hidden' : 'auto';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

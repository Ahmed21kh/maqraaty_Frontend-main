import { StudentDetailsComponent } from '../../shared/components/student-details/student-details.component';
import { MonthCarouselComponent } from '../../shared/components/month-carousel/month-carousel.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { EditStudentsModalComponent } from '../../shared/components/edit-students-modal/edit-students-modal.component';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import {
  NzTableFilterFn,
  NzTableFilterList,
  NzTableSortFn,
  NzTableSortOrder,
} from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzUploadChangeParam, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ApiService } from '../../core/services/api.service';
import { createNameResolver } from '../../core/utils/student-lookup';
import Swal from 'sweetalert2';
import { NzImageModule } from 'ng-zorro-antd/image';
import { map } from 'rxjs';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { environment } from '../../../environments/environment';
import { EmptyPipe } from '../../shared/pipes/empty.pipe';
import { OrderByPipe } from '../../shared/pipes/order-by/order-by.pipe';
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { parse } from 'date-fns';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { WhatsappSocketService } from '../../core/whatsapp/whatsapp-socket.service';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTooltipDirective } from "ng-zorro-antd/tooltip";

/** Months 1–12 for the month picker. */
const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

export interface DataItem {
  _id: string;
  code: number;
  name: string;
  image: string;
  phone_1: string[];
  phone_2: string[];
  phone_3: string[];
  age: any;
  study_year: string;
  has_relative: string;
  relative: string[];
  is_payment: string;
  is_Azhar: string;
  landline: string;
  address: string;
  notes: string;
  date: Date;
  amount: any;
  active_status:string;
}
interface AttendanceItem {
  attend_days_month: any;
  status: string;
  date: string;
}
interface Student_Names {
  _id: string;
  name: string;
}

interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<DataItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<DataItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}

@Component({
  selector: 'app-students-not-pay',
  host: { ngSkipHydration: 'true' },
  standalone: true,
  imports: [
    StudentDetailsComponent,
    MonthCarouselComponent,
    FilterBarComponent,
    EditStudentsModalComponent,
    NzGridModule,
    PageHeaderComponent, StatCardComponent,
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
    SlickCarouselModule,
    NzSpinModule,
    NzCardModule,
    NzTagModule,
    NzPopconfirmModule,
    NzTooltipDirective
],
  templateUrl: './students-not-pay.component.html',
  styleUrl: './students-not-pay.component.scss',
  providers: [NzModalService]
})
export class StudentsNotPayComponent implements OnInit {
  isVisible = false;
  isEdit = false;
  searchName: string = '';
  searchPhone: string = '';
  searchCode: string = '';
  studentId = '';
  isDeleteModal = false;
  private readonly modalService = inject(NzModalService);
  private readonly whatsappService = inject(WhatsappSocketService);
  readonly bulkInProgress = this.whatsappService.bulkInProgress;
  readonly bulkProgress = this.whatsappService.bulkProgress;
  readonly bulkResults = this.whatsappService.bulkResults;
  listOfData: DataItem[] = [];
  url: string = environment.apiUrl;
  listOfColumns: ColumnItem[] = [
    {
      name: 'الكود',
      sortOrder: null,
      sortFn: (a: DataItem, b: DataItem) => a._id.localeCompare(b._id),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: (list: string[], item: DataItem) =>
        list.some((name) => item._id.indexOf(name) !== -1),
    },
    {
      name: 'الاسم',
      sortOrder: null,
      sortFn: (a: DataItem, b: DataItem) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: (list: string[], item: DataItem) =>
        list.some((name) => item.name.indexOf(name) !== -1),
    },

    {
      name: 'رقم الهاتف',
      sortOrder: null,
      sortFn: (a: DataItem, b: DataItem) => a.phone_1.length - b.phone_1.length,
      sortDirections: ['descend', null],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: true,
    },
    // {
    //   name: 'رقم الهاتف الثاني',
    //   sortOrder: null,
    //   sortFn: (a: DataItem, b: DataItem) => a.phone_2.length - b.phone_2.length,
    //   sortDirections: ['descend', null],
    //   listOfFilter: [],
    //   filterFn: null,
    //   filterMultiple: true,
    // },
    // {
    //   name: 'التليفون الارضي',
    //   sortOrder: null,
    //   sortFn: (a: DataItem, b: DataItem) =>
    //     a.landline.localeCompare(b.landline),
    //   sortDirections: ['descend', null],
    //   listOfFilter: [],
    //   filterFn: null,
    //   filterMultiple: true,
    // },
    // {
    //   name: 'تاريخ التسجيل',
    //   sortOrder: null,
    //   sortFn: null,
    //   sortDirections: ['descend', null],
    //   listOfFilter: [],
    //   filterFn: null,
    //   filterMultiple: true,
    // },
    {
      name: 'المصرفات',
      sortOrder: null,
      sortFn: null,
      sortDirections: ['descend', null],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: true,
    },
    {
      name: 'العنوان',
      sortOrder: null,
      sortDirections: ['ascend', 'descend', null],
      sortFn: null,
      filterMultiple: false,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'الصورة',
      sortOrder: null,
      sortFn: null,
      sortDirections: [],
      filterMultiple: false,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'الحالة',
      sortOrder: null,
      sortDirections: [],
      sortFn: null,
      filterMultiple: false,
      listOfFilter: [],
      filterFn: null,
    }
  ];
  pageSize: number = 100;
  pageNumber: number = 1;
  count!: number;
  total!: number;
  totalPages!: number;
  loadingAdd: boolean = false;
  loadingAEdit: boolean = false;
  loadingSearch: boolean = false;
  loadingData: boolean = false;
  students_Name: Student_Names[] = [];
  student_Data!: DataItem;
  showStudent: boolean = false;
  editingStudent = false;
  @ViewChild(EditStudentsModalComponent) editForm?: EditStudentsModalComponent;
  nameContent!: string;
  loadingPay: boolean = false;
  isDeActivate: boolean = false;
  loadingDeactivate: boolean = false;
  date: any = null;
  listofMonths!: any;
  activatedDaate:Date = new Date();
  activeMonth = new Date().getMonth() + 1;
  today: Date = new Date(); // Get today's date
  currentDay:number =  new Date().getDay();
  currentYear: number = this.today.getFullYear();
  currentMonth: number = this.today.getMonth() + 1; // Adding 1 since months are 0-based
  startDate: string = new Date(this.currentYear, this.currentMonth - 1, 0)
    .toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('T')[0];
  endDate: string = new Date(this.currentYear, this.currentMonth, 1)
    .toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('T')[0];

  totalAmount: number = 0;
  @ViewChild('slickModal') slickModal!:SlickCarouselComponent;
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: ApiService
  ) {}

  slideConfig = { slidesToShow: 6, slidesToScroll: 2 ,infinite:false , rtl:true };

  slickInit(e: any) {
    if (this.activeMonth) {
      this.centerMonth(this.activeMonth);
    }
  }

  private centerMonth(month: any) {
    const index = this.listofMonths.indexOf(month);
    if (index === -1) return;

    const slidesToShow = this.slideConfig.slidesToShow;
    const centerOffset = Math.floor(slidesToShow / 2);

    let targetIndex = index - centerOffset;

    // clamp so we don't scroll past the start
    if (targetIndex < 0) targetIndex = 0;

    // clamp so we don't scroll past the end
    const maxIndex = this.listofMonths.length - slidesToShow;
    if (targetIndex > maxIndex) targetIndex = Math.max(maxIndex, 0);

    // slight delay ensures slick has fully initialized before programmatic scroll
    setTimeout(() => {
      this.slickModal?.slickGoTo(targetIndex);
    }, 0);
  }

  breakpoint(e: any) {
  }

  afterChange(e: any) {
  }

  beforeChange(e: any) {
  }

  myForm = this.fb.group({
    name: ['', [Validators.minLength(4)]],
    phone_1: this.fb.array([
      new FormControl('', [Validators.min(11), Validators.pattern(/^\d{11}$/)]),
    ]),
    phone_2: this.fb.array([
      new FormControl('', [Validators.min(11), Validators.pattern(/^\d{11}$/)]),
    ]),
    phone_3: this.fb.array([
      new FormControl('', [Validators.min(11), Validators.pattern(/^\d{11}$/)]),
    ]),
    age: [null],
    study_year: [''],
    has_relative: [''],
    relative: this.fb.array([new FormControl('')]),
    is_payment: [''],
    is_Azhar: [''],
    landline: ['', [Validators.min(7)]],
    address: [''],
    date: [new Date()],
    image: [''],
    notes: [''],
    amount: [null],
  });

  payForm = this.fb.group({
    date: [
      new Date().toLocaleDateString('en-CA'),
    ],
    amount: [null, [Validators.required]],
  });
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
    return this.payForm.controls;
  }

  paymentForm = this.fb.group({
    amount: [0],
  });
  openShowStudent(data: DataItem) {
    // this.getOneUser(id).then(()=>{
    this.editingStudent = false;
    this.student_Data = data;
    this.showStudent = true;
    // })
  }
  /** The details modal saved the student in place: leave edit mode, show the fresh data and refresh the list. */
  onStudentSaved(): void {
    this.editingStudent = false;
    const id = this.student_Data?._id;
    if (id) {
      this.appService.getOne_student(id).subscribe({
        next: (fresh) => (this.student_Data = { ...this.student_Data, ...fresh }),
      });
    }
    this.getDataOfStudents();
  }

  closeShowStudent() {
    this.editingStudent = false;
    this.showStudent = false;
  }
  // O(1) id→name lookup (index rebuilt only when the students list instance changes)
  private readonly nameResolver = createNameResolver(() => this.students_Name);
  getNameOfOneStudent(id: string) {
    return this.nameResolver(id);
  }

  handleAdd(title: string) {
    const formControl = new FormControl('', [
      Validators.min(11),
      Validators.pattern(/^\d{11}$/),
    ]);
    const formControl2 = new FormControl(null);
    if (title == 'phone_1') {
      this.arr_phone_1.push(formControl);
    } else if (title == 'phone_2') {
      this.arr_phone_2.push(formControl);
    } else if (title == 'phone_3') {
      this.arr_phone_3.push(formControl);
    } else if (title == 'relative') {
      this.arr_relative.push(formControl2);
    }
  }
  handleRemove(index: number, title: string) {
    if (title == 'phone_1') {
      this.arr_phone_1.removeAt(index);
    } else if (title == 'phone_2') {
      this.arr_phone_2.removeAt(index);
    } else if (title == 'phone_3') {
      this.arr_phone_3.removeAt(index);
    } else if (title == 'relative') {
      this.arr_relative.removeAt(index);
    }
  }
  resetData() {
    this.myForm.reset({
      name: '',
      phone_1: [],
      phone_2: [],
      phone_3: [],
      age: null,
      study_year: '',
      has_relative: '',
      relative: [],
      is_payment: '',
      is_Azhar: '',
      landline: '',
      address: '',
      image: '',
      notes: '',
      date: new Date(),
      amount: null,
    });
    this.paymentForm.reset({
      amount: 0,
    });
    this.arr_phone_1.reset(['']);
    this.arr_phone_2.reset(['']);
    this.arr_phone_3.reset(['']);
    this.arr_relative.reset(['']);

    // this.arr_phone_1.push(new FormControl(''))
    // this.arr_phone_3.push(new FormControl(''))
    // this.arr_phone_3.push(new FormControl(''))
  }

  resetPayData() {
    this.payForm.reset({
      date: new Date().toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      amount: null,
    });
    this.studentId = '';
  }
  handleSearchQuery() {
    let x = '&status=active';
    if (this.searchName) {
      x += `&name=${this.searchName?.trim()?.toLowerCase()}`;
    }
    if (this.searchCode) {
      x += `&code=${this.searchCode?.trim()}`;
    }
    if (this.searchPhone) {
      x += `&phone=${this.searchPhone?.trim()}`;
    }
    if (this.startDate) {
      x += `&startDate=${this.startDate}`;
    }
    if (this.endDate) {
      x += `&endDate=${this.endDate}`;
    }
    this.loadingSearch = true;
    this.appService
      .getNotPayStudents(x, this.pageNumber, this.pageSize)
      .subscribe({
        next: async (data: any) => {
          this.listOfData = await data?.data;
          // this.count = await data?.metaData?.count;
          this.total = await data?.metaData[0]?.total;
          this.pageNumber = await data?.metaData[0]?.pageNumber?data?.metaData[0]?.pageNumber:1;
          this.totalPages = await data?.metaData[0]?.totalPages;
          this.totalAmount = await data?.totalAmount[0]?.total;
          this.loadingSearch = false;
        },
        error: (err) => {
          this.msg.error(err.message);
          this.loadingSearch = false;
        },
      });
  }
  async getDataOfStudents() {
    let x = '&status=active';
    if (this.startDate) {
      x += `&startDate=${this.startDate}`;
    }
    if (this.endDate) {
      x += `&endDate=${this.endDate}`;
    }
    this.loadingData = true;
    this.appService
      .getNotPayStudents(x, this.pageNumber, this.pageSize)
      .subscribe({
        next: async (data) => {
          this.total = await data?.metaData[0]?.total;
          this.listOfData = await data.data;
          // this.count = await data?.metaData[0]?.total;
          this.totalPages = await data?.metaData[0]?.totalPages;
          this.totalAmount = await data?.totalAmount[0]?.total;
          let months = await data.data.map(
            (d: any) => new Date(d.date).getMonth() + 1
          );

          let uniqMonth = new Set([...months]);
          this.listofMonths = MONTH_NUMBERS;
          this.loadingData = false;
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
  }

  /**
   * Opens the paid-expenses page on the same month that is selected here (first → last calendar day),
   * so "what is owed" and "what was collected" can be compared for the same period.
   */
  paidExpensesParams(): { from: string; to: string } {
    const pad = (n: number) => String(n).padStart(2, '0');
    const lastDay = new Date(this.currentYear, this.activeMonth, 0).getDate();
    return {
      from: `${this.currentYear}-${pad(this.activeMonth)}-01`,
      to: `${this.currentYear}-${pad(this.activeMonth)}-${pad(lastDay)}`,
    };
  }

  handleChangeMonth(month: number) {
    this.activeMonth = month;
    this.activatedDaate.setMonth(month - 1);
    this.activatedDaate = this.activatedDaate;

    this.startDate = new Date(this.currentYear, month - 1, 0)
      .toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .split('T')[0];
    this.endDate = new Date(this.currentYear, month, 1)
      .toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .split('T')[0];
    this.handleSearchQuery();
  }
  async getStudentsName() {
    this.appService.getStudents_names("active").subscribe({
      next: async (data) => {
        this.students_Name = await data;
      },
      error: (err) => {
        this.msg.error(err.message);
      },
    });
  }

  async getOneUser(Id: string) {
    this.appService.getOne_student(Id).subscribe({
      next: async (data) => {
        this.student_Data = await data;
      },
      error: (err) => {
        this.msg.error(err.message);
      },
    });
  }

  ngOnInit(): void {
    this.getDataOfStudents();
    // this.getStudentsName()
    this.date = [this.startDate, this.endDate];
  }

  onChange(result: Date[]): void {
    if (result.length > 0) {
      this.startDate = result[0]
        .toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .split('T')[0];
      this.endDate = result[1]
        .toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .split('T')[0];
      this.handleSearchQuery();
    } else {
      this.startDate = '';
      this.endDate = '';
      this.handleSearchQuery();
    }
  }

  changePagination(e: any) {
    this.pageNumber = e;
    this.getDataOfStudents();
  }
  showModal(): void {
    this.isVisible = true;
    this.isEdit = false;
  }

  handleOpenConfirmPay(data: any): void {
    this.studentId = data?._id;
    this.isDeleteModal = true;
    this.student_Data = data
  }

  handleCancelConfirmpay(): void {
    this.isDeleteModal = false;
    this.resetPayData();
  }

  handleDelete() {
    this.isDeleteModal = false;
    this.appService
      .activate_deActivate_Student(this.studentId , 'in_active')
      .pipe(
        map(() => {
          // this.msg.loading("loading...")
        })
      )
      .subscribe({
        next: (response) => {
          this.msg.success('تم الحذف بنجاح');
          this.getDataOfStudents().then(() => {
            this.isDeleteModal = false;
          });
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
  }

  handlePay() {
    this.loadingPay = true;
    const { date , amount } = this.payForm.value;
    const date1:any = date
    const obj = {
      date:new Date(date1).toLocaleDateString('en-CA'),
      amount
    }
    this.appService
      .addPayment(obj, this.studentId)
      .subscribe({
        next: (response) => {
          this.msg.success('تم الدفع بنجاح');
          this.resetPayData();
          this.confirmPay(this.student_Data);
          this.getDataOfStudents().then(() => {
            this.isDeleteModal = false;
            this.loadingPay = false;
          });
        },
        error: (err) => {
          this.msg.error(err.message);
          this.loadingPay = false;
        },
      });
  }


  handleOk(): void {
    if (this.myForm.value.has_relative == 'نعم') {
      this.arr_relative.controls.map((data) => data.markAllAsTouched());
    } else {
      this.arr_relative.controls.map((data) => data.clearValidators());
    }

    if (this.myForm.valid) {
      this.loadingAdd = true;
      this.appService.addStudent(this.myForm.value).subscribe({
        next: async (res) => {
          this.msg.success('تم الاضافة بنجاح');
          this.handleAddAttendance(res.data._id);
          this.getDataOfStudents().then(() => {
            this.loadingAdd = false;
            this.isVisible = false;
            this.resetData();
          });
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
    } else {
      this.validate();

      // this.myForm.controls.image.markAsTouched();
    }
  }
  handleOpenEditModal(data: DataItem) {
    this.studentId = data?._id;
    this.isEdit = true;
    this.isVisible = true;
    this.myForm.setValue({
      name: data.name,
      phone_1: data.phone_1,
      phone_2: data.phone_2,
      phone_3: data.phone_3,
      age: data.age,
      study_year: data.study_year,
      has_relative: data.has_relative,
      relative: data.relative,
      is_payment: data.is_payment,
      is_Azhar: data.is_Azhar,
      landline: data.landline,
      address: data.address,
      image: data.image,
      notes: data.notes,
      date: data.date,
      amount: data.amount,
    });
  }
  validate() {
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
    this.arr_phone_1.controls.map((data) => data.markAllAsTouched());
    this.arr_phone_2.controls.map((data) => data.markAllAsTouched());
    this.arr_phone_3.controls.map((data) => data.markAllAsTouched());
  }
  handleSubmitEdit() {
    if (this.myForm.value.has_relative == 'نعم') {
      this.arr_relative.controls.map((data) => data.markAllAsTouched());
    } else {
      this.arr_relative.controls.map((data) => data.clearValidators());
    }
    if (this.myForm.valid) {

      this.isEdit = true;
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
            this.getDataOfStudents().then(() => {
              this.resetData();
              this.isVisible = false;
              this.isEdit = false;
            });
          },
          error: (err) => {
            this.msg.error(err.message);
          },
        });
    } else {
      this.validate();
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    this.loadingAdd = false;
    this.loadingAEdit = false;
    this.resetData();
    setTimeout(() => {
      this.isEdit = false;
    }, 100);
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
        date: new Date() || null,
        amount: this.myForm.value.amount || null,
      });
    } else if (status === 'error') {
      this.msg.error('فشل رفع الصورة');
    }
  }

  handleAddAttendance(id: string) {

    let obj: AttendanceItem = {
      date: new Date().toUTCString(),
      status: 'حاضر',
      attend_days_month: this.appService.getDatesAndDays(),
    };
    this.appService.addAttendance(obj, id).subscribe({
      next: (res) => {
      },
      error: (err) => {
        this.msg.error(err.message);
      },
    });
  }

  handleOpenConfirmDeActivate(id: any): void {
    this.studentId = id;
    this.isDeActivate = true;
  }

  handleCancelConfirmDeActivate(): void {
    this.isDeActivate = false;
    this.studentId = '';
  }

  confirmNotPay(data: any): void {
    this.studentId = data?._id;
    let phoneList = [];
    const studentDetails = data;
    const motherPhone = studentDetails?.phone_2?.[0] || undefined;
    const fatherPhone = studentDetails?.phone_3?.[0] || undefined;
    let message = `السلام عليكم ورحمة الله وبركاته.

السادة أولياء الأمور الكرام نذكركم بسرعة سداد المصروفات.
مقرأة الإمام الشافعي.
جزاكم الله خيرًا.`
    if(motherPhone) {
      const phone = motherPhone?.trim();
       phoneList.push(phone)
    }

    if(fatherPhone) {
      const phone = fatherPhone?.trim();
       phoneList.push(phone)
    }
    this.whatsappService.sendBulk(phoneList , message);
  }

  confirmPay(data: any): void {
    this.studentId = data?._id;
    let phoneList = [];
    const studentDetails = data;
    const name = studentDetails?.name || '';
    const motherPhone = studentDetails?.phone_2?.[0] || undefined;
    const fatherPhone = studentDetails?.phone_3?.[0] || undefined;
    let message = `السلام عليكم ورحمة الله وبركاته.

 تم استلام وسداد المصروفات الخاصة ب  ${name} بنجاح.
مقرأة الإمام الشافعي.

جزاكم الله خيرًا.`
    if(motherPhone) {
      const phone = motherPhone?.trim();
       phoneList.push(phone)
    }

    if(fatherPhone) {
      const phone = fatherPhone?.trim();
       phoneList.push(phone)
    }
    this.whatsappService.sendBulk(phoneList , message);
  }

  handleActivate_deActivate_Student() {
    // this.isDeleteModal = false;
    this.loadingDeactivate = true;
    this.appService
      .activateStudent(this.studentId , 'in_active' , this.activatedDaate)
      .pipe(
        map(() => {
          // this.msg.loading("loading...")
        })
      )
      .subscribe({
        next: (response) => {
          this.msg.success('تم التعطيل بنجاح');
          this.getDataOfStudents().then(() => {
            this.isDeActivate = false;
            this.loadingDeactivate = false;
          });
        },
        error: (err) => {
          this.msg.error(err.message);
          this.loadingDeactivate = false;
        },
      });
  }
}

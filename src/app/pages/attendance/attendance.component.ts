import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
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
import { AappServiceService } from '../../services/aapp-service.service';
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
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { environment } from '../../../environments/environment.development';
import { EmptyPipe } from '../../pipes/empty.pipe';
import { OrderByPipe } from '../../pipes/order-by/order-by.pipe';
import * as datefn from 'date-fns';
import { ar, arEG, enCA } from 'date-fns/locale';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import moment from 'moment';
import { NzCardModule } from 'ng-zorro-antd/card';
interface StudentItem {
  _id: string;
  code: number;
  name: string;
  image: string;
  phone_1: string[];
  phone_2: string[];
  phone_3: string[];
  age: number;
  study_year: string;
  has_relative: string;
  relative: string[];
  is_payment: string;
  is_Azhar: string;
  landline: string;
  address: string;
  notes: string;
  date: Date;
  amount: number;
}
interface DataItem {
  _id: string;
  attend_days_month: [];
  isToday: boolean;
  student: string;
  status: string;
  date: string;
  studentDetails: StudentItem;
}
interface DatesObject {
  day: string;
  date: string;
  status: string;
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
  selector: 'app-attendance',
  standalone: true,
  host: { ngSkipHydration: 'true' },
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss',
  imports: [
    NzGridModule,
    BreadcrumbComponent,
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
    NzToolTipModule,
    EmptyPipe,
    OrderByPipe,
    NzSkeletonModule,
    NzTagModule,
    NzPopconfirmModule,
    NzPopoverModule,
    SlickCarouselModule,
    NzCardModule
  ],
})
export class AttendanceComponent {
  isVisible = false;
  isEdit = false;
  searchName: string = '';
  searchPhone: string = '';
  searchCode: string = '';
  studentId = '';
  attendanceId: string = '';
  isDeleteModal = false;
  listOfData: DataItem[] = [];
  attendanceDate: string = new Date().toLocaleDateString();
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
      sortFn: null,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'التاريخ',
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
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
      name: 'حالة الحضور',
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },
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
  student_Data!: StudentItem;
  showStudent: boolean = false;
  nameContent!: string;
  dateFilter!: string;
  editModal: boolean = false;
  dateAttendance: Date = new Date();
  attendanceStatus!: string;
  dataOfDays!: DatesObject[];
  absence: number = 0;
  attend: number = 0;
  dataOfAllDates!: DatesObject[];
  attendanceDetails: any = {};
  attend_student_obj: any = {};
  attendId!: any;
  radioVal: string = '_';
  listofMonths!: any;
  activeMonth = new Date().getMonth() + 1;
  allMonths!: any[];
  visible: boolean = false
  popOverVisible: Map<string, boolean> = new Map();
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: AappServiceService,
    private cd: ChangeDetectorRef
  ) {}

  paymentForm = this.fb.group({
    amount: [0, Validators.required],
    date: [new Date(), Validators.required],
  });

  get pf() {
    return this.paymentForm.controls;
  }

  slideConfig = {
    slidesToShow: 6,
    slidesToScroll: 2,
    infinite: false,
    rtl: true,
  };
  slickInit(e: any) {
    console.log('slick initialized');
  }

  breakpoint(e: any) {
    console.log('breakpoint');
  }

  afterChange(e: any) {
    console.log('afterChange');
  }

  beforeChange(e: any) {
    console.log('beforeChange');
  }

  onTagClick(event: boolean, id: any) {
    console.log(event);
    this.attendId = id;
    this.popOverVisible.set(id, event);
    console.log(this.popOverVisible);

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
    if (this.dateFilter) {
      x += `&date=${this.dateFilter}`;
    }
    console.log(x);
    this.loadingSearch = true;
    this.appService
      .getAttendanceData(this.pageNumber, this.pageSize, x)
      .subscribe({
        next: async (data: any) => {
          console.log(data?.data);
          this.listOfData = await data?.data;
          this.count = await data?.metaData?.count;
          this.totalPages = await data?.metaData?.totalPages;
          this.total = await data?.metaData?.total;
          this.loadingSearch = false;
        },
        error: (err) => {
          this.msg.error(err.message);
          this.loadingSearch = false;
        },
      });
  }

  changeAttendanceDate(e: Date) {
    // console.log(e.getMonth());
    this.dataOfDays = this.dataOfAllDates.filter(
      (a: DatesObject) => new Date(a.date).getMonth() == e.getMonth()
    );
    this.absence = this.dataOfAllDates.filter(
      (d: any) => d.status === 'غائب'
    )?.length;
  }
  checkDate(date: string): boolean {
    return (
      new Date(date).toLocaleDateString() ==
      this.dateAttendance.toLocaleDateString()
    );
  }
  handleCompareDate(date: any, status: string, data: any) {
    console.log({ name: data.studentDetails.name, status: status, date: date });

    if (
      new Date(date).toLocaleDateString() ==
      this.dateAttendance.toLocaleDateString()
    ) {
      console.log('Date is equal date now');
      return status;
    }
    return '_';
  }

  changeStatusOfAttendance(e: any, data: any, date: any) {
    // console.log(data?.attend_days_month);
    // console.log(e);
    this.dateAttendance.setHours(0, 0, 0, 0);
    let days = this.appService.getDatesAndDays();
    let newDates = [];
    if (this.editModal) {
      newDates = this.dataOfAllDates?.map((d: any) =>
        new Date(d.date).toISOString() == new Date(date).toISOString()
          ? { ...d, date: new Date(d.date), status: e }
          : { ...d, date: new Date(d.date) }
      );

      console.log('newDates', newDates);
      this.appService
        .updateAttendance(data?._id, {
          attend_days_month: newDates,
          date: datefn.format(new Date(), 'yyyy-MM-dd', { locale: arEG }),
          status: data?.status,
        })
        .subscribe({
          next: (res) => {
            console.log(res);
            const newDays = res.data?.attend_days_month.filter(
              (d: any) => new Date(d.date).getMonth() + 1 === this.activeMonth
            );
            this.dataOfDays = newDays;
            this.absence = newDays.filter(
              (d: any) => d.status === 'غائب'
            )?.length;
            this.attend = newDays.filter(
              (d: any) => d.status === 'حاضر'
            )?.length;
            this.student_Data = res.data;
            this.msg.success('تم تعديل الحضور بنجاح');
            this.getDataOfAttendance();
          },
          error: (err) => this.msg.error(err.message),
        });
    } else {
    if (
      data?.attend_days_month?.some(
        (e: any) => new Date(e.date).getMonth() == new Date().getMonth()
      )
    ) {
      this.dataOfDays = data?.attend_days_month;
    } else {
      this.dataOfDays = [...data?.attend_days_month, ...days];
    }
      newDates = this.dataOfDays?.map((d: any) =>
        new Date(d.date).toISOString() == this.dateAttendance.toISOString()
          ? { ...d, date: new Date(d.date), status: e }
          : { ...d, date: new Date(d.date) }
      );
      // console.log(newDates);
      this.appService
        .updateAttendance(data?._id, {
          attend_days_month: newDates,
          date: datefn.format(new Date(), 'yyyy-MM-dd', { locale: arEG }),
          status: e,
        })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.dataOfDays = res.data?.attend_days_month;
            this.msg.success('تم تعديل الحضور بنجاح');
            this.getDataOfAttendance();
            this.popOverVisible.set(data._id,false);
            // this.popOverVisible.delete(data._id)
            console.log(this.popOverVisible);

            this.cd.detectChanges();
          },
          error: (err) => this.msg.error(err.message),
        });
    }
  }

  openShowStudent(data: StudentItem) {
    this.student_Data = data;
    this.showStudent = true;
  }

  closeShowStudent() {
    this.showStudent = false;
  }

  studentName(id: string) {
    let student = this.students_Name.filter((data) => data._id == id)[0]?.name;
    return student;
  }

  getNameOfOneStudent(id: string) {
    let student = this.students_Name.filter((data) => data._id == id)[0]?.name;
    return student;
  }

  resetData() {
    this.paymentForm.reset({
      amount: 0,
      date: new Date(),
    });
    this.attendanceId = '';
    this.absence = 0;
  }

  onChange(result: Date): void {
    console.log('onChange: ', result);
    if (result !== null) {
      this.dateFilter = result.toISOString();
      this.handleSearchQuery();
    } else {
      this.dateFilter = '';
      this.handleSearchQuery();
    }
  }

  async getDataOfAttendance() {
    this.loadingData = true;
    this.appService
      .getAttendanceData(this.pageNumber, this.pageSize, '')
      .subscribe({
        next: async (data) => {
          console.log(data);
          this.listOfData = await data.data;
          this.count = await data?.metaData?.count;
          this.totalPages = await data?.metaData?.totalPages;
          this.total = await data?.metaData?.total;
          this.attendanceDetails = await data?.attendanceDetails[0];
          const monthNames = moment.months();
          const monthNumbers = monthNames.map((name) => {
            const date = datefn.parse(name, 'MMMM', new Date());
            return date.getMonth() + 1; // getMonth() returns 0-based month, hence +1
          });
          this.listofMonths = monthNumbers;
          this.loadingData = false;
        },
        error: (err) => {
          console.log(err);
          this.msg.error(err.message);
        },
      });
  }
  handleChangeMonth(month: number) {
    this.activeMonth = month;
    this.dataOfDays = this.dataOfAllDates.filter(
      (a: DatesObject) => new Date(a.date).getMonth() + 1 == month
    );
    this.absence = this.dataOfDays.filter(
      (d: any) =>
        d.status === 'غائب' && new Date(d.date).getMonth() + 1 == month
    )?.length;
    this.attend = this.dataOfDays.filter(
      (d: any) =>
        d.status === 'حاضر' && new Date(d.date).getMonth() + 1 == month
    )?.length;
  }

  handleOpenConfirmDelete(id: any): void {
    this.attendanceId = id;
    this.isDeleteModal = true;
  }

  handleCancelConfirmDelete(): void {
    this.isDeleteModal = false;
  }

  handleDelete() {
    this.isDeleteModal = false;
    this.appService
      .deleteAttendance(this.attendanceId)
      .pipe(
        map(() => {
          // this.msg.loading("loading...")
        })
      )
      .subscribe({
        next: (response) => {
          this.msg.success('تم الحذف بنجاح');
          this.getDataOfAttendance().then(() => {
            this.isDeleteModal = false;
          });
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
  }

  ngOnInit(): void {
    this.getDataOfAttendance();
  }

  changePagination(e: any) {
    console.log(e);
    this.pageNumber = e;
    this.getDataOfAttendance();
  }

  showModal(): void {
    this.isVisible = true;
    this.isEdit = false;
  }

  dataOfDatesArr() {
    console.log(
      'Dates Data =>>>>>>',
      this.dataOfDays.filter(
        (a: DatesObject) =>
          new Date(a.date).getMonth() == this.dateAttendance.getMonth()
      )
    );
    let data = this.dataOfDays.filter(
      (a: DatesObject) =>
        new Date(a.date).getMonth() == this.dateAttendance.getMonth()
    );
    return data;
  }

  showEditModal(id: string, sId: string, data: any, student: any) {
    this.attendanceId = id;
    this.studentId = sId;
    this.editModal = true;
    let days = this.appService.getDatesAndDays();
    this.student_Data = student;
    // data.map((e: any) => console.log(new Date(e.date).getMonth()));

    if (
      data.some(
        (e: any) => new Date(e.date).getMonth() == new Date().getMonth()
      )
    ) {
      this.dataOfAllDates = data;
      this.dataOfDays = this.dataOfAllDates.filter(
        (d) => new Date(d.date).getMonth() + 1 == this.activeMonth
      );
    } else {
      this.dataOfAllDates = [...data, ...days];
      this.dataOfDays = this.dataOfAllDates.filter(
        (d) => new Date(d.date).getMonth() + 1 == this.activeMonth
      );
    }
    this.absence = this.dataOfAllDates.filter(
      (d: any) =>
        d.status === 'غائب' &&
        new Date(d.date).getMonth() + 1 == this.activeMonth
    )?.length;
    this.attend = this.dataOfAllDates.filter(
      (d: any) =>
        d.status === 'حاضر' &&
        new Date(d.date).getMonth() + 1 == this.activeMonth
    )?.length;
  }

  cancelEditModal() {
    this.editModal = false;
    this.resetData();
    this.activeMonth = new Date().getMonth() + 1;
  }

  handleDeleteAttendance() {}

  updatePayment() {
    this.appService
      .updatePayment(this.attendanceId, {
        ...this.paymentForm,
        student: this.studentId,
      })
      .subscribe({
        next: async (data) => {
          this.getDataOfAttendance().then((data) => {
            this.msg.success('payment updated successfully');
            this.editModal = false;
            this.resetData();
          });
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
  }

  validate() {
    this.paymentForm.controls.amount.markAllAsTouched();
    this.paymentForm.controls.date.markAllAsTouched();
  }
}

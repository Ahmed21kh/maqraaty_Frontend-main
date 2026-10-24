import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StudentAvatarComponent } from '../../shared/components/student-avatar/student-avatar.component';
import { StudentDetailsComponent } from '../../shared/components/student-details/student-details.component';
import { MonthCarouselComponent } from '../../shared/components/month-carousel/month-carousel.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { EditStudentsModalComponent } from '../../shared/components/edit-students-modal/edit-students-modal.component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
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
import { ApiService } from '../../core/services/api.service';
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
import { environment } from '../../../environments/environment';
import { EmptyPipe } from '../../shared/pipes/empty.pipe';
import { OrderByPipe } from '../../shared/pipes/order-by/order-by.pipe';
import * as datefn from 'date-fns';
import { ar, arEG, enCA } from 'date-fns/locale';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NzCardModule } from 'ng-zorro-antd/card';
import { StudentItem } from '../../core/models/app.model';
import { WhatsappSocketService } from '../../core/whatsapp/whatsapp-socket.service';


/** Months 1–12 for the month picker. */
const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

interface DataItem {
  _id: string;
  attend_days_month: [];
  isToday: boolean;
  student: string;
  status: string;
  date: string;
  studentDetails:StudentItem;
}
interface DatesObject {
  day: string;
  date: string;
  status: string;
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
    StatCardComponent,
    StudentAvatarComponent,
    StudentDetailsComponent,
    MonthCarouselComponent,
    FilterBarComponent,
    EditStudentsModalComponent,
    NzGridModule,
    PageHeaderComponent,
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
export class AttendanceComponent implements OnInit {
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
      name: 'رقم الهاتف',
      sortOrder: null,
      sortFn: (a: DataItem, b: DataItem) => a.studentDetails.phone_1.length - b.studentDetails.phone_1.length,
      sortDirections: ['descend', null],
      listOfFilter: [],
      filterFn: null,
      filterMultiple: true,
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

  /** Present / (present + absent) of the days recorded so far, as a whole percent. */
  attendanceRate(): number {
    const present = Number(this.attendanceDetails?.totalAttend) || 0;
    const absent = Number(this.attendanceDetails?.totalAbsent) || 0;
    return present + absent > 0 ? Math.round((present / (present + absent)) * 100) : 0;
  }
  totalPages!: number;
  loadingAdd: boolean = false;
  loadingAEdit: boolean = false;
  loadingSearch: boolean = false;
  loadingData: boolean = false;
  students_Name = (this.appService.ensureActiveNames(), this.appService.activeStudentsName);
  student_Data!: StudentItem;
  showStudent: boolean = false;
  editingStudent = false;
  @ViewChild(EditStudentsModalComponent) editForm?: EditStudentsModalComponent;
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
  /** Year being viewed in the attendance modal (the records span several years). */
  activeYear = new Date().getFullYear();
  availableYears: number[] = [new Date().getFullYear()];
  /** Name shown in the modal title (the update response does not carry studentDetails). */
  modalStudentName = '';
  allMonths!: any[];
  visible: boolean = false;
  // query-string suffix appended to the API url; must start as "" (an initial `{}` became "[object Object]" and broke `limit`)
  readonly searchFilter = signal<string>("");
  popOverVisible: Map<string, boolean> = new Map();
  private readonly whatsappService = inject(WhatsappSocketService);
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: ApiService,
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
  }

  @ViewChild('slickModal') slickModal: any;

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

  onTagClick(event: boolean, id: any) {
    this.attendId = id;
    this.popOverVisible.set(id, event);

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
    this.searchFilter.set(x);
    this.loadingSearch = true;
    this.appService
      .getAttendanceData(this.pageNumber, this.pageSize, x)
      .subscribe({
        next: async (data: any) => {
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

    if (
      new Date(date).toLocaleDateString() ==
      this.dateAttendance.toLocaleDateString()
    ) {
      return status;
    }
    return '_';
  }

  confirmSendAlert(data: any): void {
    this.studentId = data?._id;
    let phoneList = [];
    const studentDetails = data;
    const name = studentDetails?.name || '';
    const motherPhone = studentDetails?.phone_2?.[0] || undefined;
    const fatherPhone = studentDetails?.phone_3?.[0] || undefined;
    let message = `السلام عليكم ورحمة الله وبركاته.

نفيدكم بأن ${name} لم يحضر اليوم.
نرجو منكم المتابعة والحرص على انتظام الحضور، وجزاكم الله خيرًا.
مقرأة الإمام الشافعي`
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


  changeStatusOfAttendance(e: 'غائب' | 'حاضر', data: any, date: any) {
    const status = e;
    const studentDetails = data?.studentDetails;
    this.dateAttendance.setHours(0, 0, 0, 0);
    let days = this.appService.getDatesAndDays();
    let newDates: any[] = [];
    if (this.editModal) {
      newDates = this.dataOfAllDates?.map((d: any) =>
        new Date(d.date).toISOString() == new Date(date).toISOString()
          ? { ...d, date: new Date(d.date), status: e }
          : { ...d, date: new Date(d.date) }
      );

      this.appService
        .updateAttendance(data?._id, {
          attend_days_month: newDates,
          date: datefn.format(new Date(), 'yyyy-MM-dd', { locale: arEG }),
          status: data?.status,
        })
        .subscribe({
          next: (res) => {
            // Take the saved list from the server so the modal and the data we send next time stay in sync.
            this.dataOfAllDates = res.data?.attend_days_month ?? newDates;
            this.refreshYears();
            this.dataOfDays = this.dataOfAllDates.filter((d: any) =>
              this.inMonth(d, this.activeMonth, this.activeYear)
            );
            if (status == 'غائب') {
              this.confirmSendAlert(studentDetails);
            }
            this.recount();
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
            this.dataOfDays = res.data?.attend_days_month;
            if (status == 'غائب') {
              this.confirmSendAlert(studentDetails);
            }
            this.msg.success('تم تعديل الحضور بنجاح');
            this.getDataOfAttendance();
            this.popOverVisible.set(data._id,false);
            // this.popOverVisible.delete(data._id)

            this.cd.detectChanges();
          },
          error: (err) => this.msg.error(err.message),
        });
    }
  }

  openShowStudent(data: StudentItem) {
    this.editingStudent = false;
    this.student_Data = data;
    this.showStudent = true;
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
    this.getDataOfAttendance();
  }

  closeShowStudent() {
    this.editingStudent = false;
    this.showStudent = false;
  }

  studentName(id: string) {
    let student = this.students_Name().find(data => data._id == id)?.name
    return student;
  }

  getNameOfOneStudent(id: string) {
    let student = this.students_Name().find(data => data._id == id)?.name
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
      .getAttendanceData(this.pageNumber, this.pageSize, this.searchFilter())
      .subscribe({
        next: async (data) => {
          this.listOfData = await data.data;
          this.count = await data?.metaData?.count;
          this.totalPages = await data?.metaData?.totalPages;
          this.total = await data?.metaData?.total;
          this.attendanceDetails = await data?.attendanceDetails[0];
          this.listofMonths = MONTH_NUMBERS;
          this.loadingData = false;
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
  }
  /** True when the record falls in the given month *and year* (month alone mixed 2024 and 2026 days). */
  private inMonth(d: { date: any }, month: number, year: number): boolean {
    const x = new Date(d.date);
    return x.getMonth() + 1 === month && x.getFullYear() === year;
  }

  private refreshYears() {
    const years = new Set<number>([new Date().getFullYear()]);
    (this.dataOfAllDates ?? []).forEach((d) => years.add(new Date(d.date).getFullYear()));
    this.availableYears = [...years].sort((a, b) => b - a);
  }

  private recount() {
    this.absence = (this.dataOfDays ?? []).filter((d: any) => d.status === 'غائب').length;
    this.attend = (this.dataOfDays ?? []).filter((d: any) => d.status === 'حاضر').length;
  }

  handleChangeYear(year: number) {
    this.activeYear = year;
    this.handleChangeMonth(this.activeMonth);
  }

  handleChangeMonth(month: number) {
    this.activeMonth = month;
    this.dataOfDays = this.dataOfAllDates.filter((a: DatesObject) => this.inMonth(a, month, this.activeYear));
    this.recount();
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
    this.pageNumber = e;
    this.getDataOfAttendance();
  }

  showModal(): void {
    this.isVisible = true;
    this.isEdit = false;
  }

  dataOfDatesArr() {
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
    this.student_Data = student;
    this.modalStudentName = student?.studentDetails?.name ?? '';

    const now = new Date();
    this.activeYear = now.getFullYear();
    // If the student has no record for the current month (of the current year) add its class days,
    // so today's attendance can be recorded. Older years stay available through the year selector.
    const hasCurrentMonth = data.some((e: any) => this.inMonth(e, now.getMonth() + 1, now.getFullYear()));
    this.dataOfAllDates = hasCurrentMonth ? data : [...data, ...this.appService.getDatesAndDays()];
    this.refreshYears();
    this.dataOfDays = this.dataOfAllDates.filter((d) => this.inMonth(d, this.activeMonth, this.activeYear));
    this.recount();
  }

  cancelEditModal() {
    this.editModal = false;
    this.resetData();
    this.activeMonth = new Date().getMonth() + 1;
    this.activeYear = new Date().getFullYear();
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

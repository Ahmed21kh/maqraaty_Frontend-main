import { MonthCarouselComponent } from '../../shared/components/month-carousel/month-carousel.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { AttendanceInsightsComponent } from './attendance-insights/attendance-insights.component';
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
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { StatisticComponent } from '../../shared/components/statistic/statistic.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { EmptyPipe } from "../../shared/pipes/empty.pipe";
import { CurrencyEgPipe } from "../../shared/pipes/currency-eg.pipe";
import { SlickCarouselComponent, SlickCarouselModule } from 'ngx-slick-carousel';
import { parse } from 'date-fns';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { Router } from '@angular/router';
import { ThemeService } from '../../../theme/theme.service';

/** Months 1–12 for the month picker. */
const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

interface DataItem {
  _id: string;
  code: number;
  name: string;
  image: string;
  phone_1: string[];
  phone_2: string[];
  phone_3: string[];
  age:number;
  study_year:string,
  has_relative:string;
  relative:string[];
  is_payment:string;
  is_Azhar:string;
  landline: string;
  address: string;
  notes: string;
  date:Date,
  amount:number
}
interface AttendanceItem {
  attend_days_month:any;
  status:string;
  date:string;
}
interface Student_Names {
  _id:string;
  name:string;
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
    selector: 'app-reports',
    standalone: true,
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.scss',
    imports: [
    MonthCarouselComponent,
        NzGridModule,
        PageHeaderComponent, StatCardComponent, AttendanceInsightsComponent,
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
        NzStatisticModule,
        NzCardModule,
        NzSkeletonModule,
        StatisticComponent,
        NzProgressModule,
        EmptyPipe,
        CurrencyEgPipe,
        SlickCarouselModule,
        NzSpinModule,
        NzTagModule,
        NzTypographyModule,
        NzEmptyModule
    ]
})
export class ReportsComponent implements OnInit {
constructor(
  private appService:ApiService,
  private msg:NzMessageService ,
  private route:Router,
  private themeService:ThemeService
){

}
theme = this.themeService.currentTheme;
date:any = null;
totalAmount:number=0
today:Date = new Date(); // Get today's date
yearDate:Date = new Date(); // Get
currentYear:number = this.today.getFullYear();
currentMonth:number = this.today.getMonth() + 1; // Adding 1 since months are 0-based
startDate:string =new Date(this.currentYear,this.currentMonth - 1 , 0).toLocaleDateString("en-CA").split("T")[0]
endDate:string =new Date(this.currentYear,this.currentMonth , 1).toLocaleDateString("en-CA").split("T")[0]
amountOfAllStudents:number = 0;
loadingData:boolean = false;
activeMonth = new Date().getMonth() + 1;
/** True while the range picker (not the month / year selectors) defines the period shown. */
private customPeriod = false;
listofMonths!: any;
total:number = 0;
historyPayments:any[] = [];
formatOne = (percent: number): string => ` % ${percent} `;
@ViewChild('slickModal') slickModal!:SlickCarouselComponent;
slideConfig = {
  slidesToShow: 6,
  slidesToScroll: 2,
  infinite: false,
  rtl: true,
  // fewer, wider month chips on narrow screens
  responsive: [
    { breakpoint: 767, settings: { slidesToShow: 4, slidesToScroll: 2 } },
    { breakpoint: 480, settings: { slidesToShow: 3, slidesToScroll: 1 } },
  ],
};

/** How many month chips slick shows at the current window width (mirrors `responsive` above). */
private visibleSlides(): number {
  const w = typeof window === 'undefined' ? 1024 : window.innerWidth;
  return w <= 480 ? 3 : w <= 767 ? 4 : this.slideConfig.slidesToShow;
}
slickInit(e: any) {
  if (this.activeMonth) {
    this.centerMonth(this.activeMonth);
  }
}

private centerMonth(month: any) {
  const index = this.listofMonths.indexOf(month);
  if (index === -1) return;

  const slidesToShow = this.visibleSlides();
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

ngOnInit(): void {
  this.getAllReports()
// console.log("Start Date:", this.startDate);
// console.log("End Date:", this.endDate);
this.date = [this.startDate,this.endDate]

          this.listofMonths = MONTH_NUMBERS;
}
getAllReports(){
  this.loadingData = true;
  this.appService.getReports(this.startDate,this.endDate).subscribe({next:(res)=>{
  // console.log(res);
  if (res?.amountOfAllStudents) {
    this.amountOfAllStudents = res?.amountOfAllStudents
  }
  if (res?.historyPayments) {
    this.historyPayments = res?.historyPayments
  }else {
    this.historyPayments = []
  }
  if(res?.totalCount){
    this.total = res?.totalCount
  }
  if (res?.totalAmount) {
    this.totalAmount = res?.totalAmount
  }else {
    this.totalAmount = 0
  }

  this.loadingData = false;
  },error:(e)=>{
  this.msg.error(e.message)
  this.loadingData = false;
  }})
}
getPercent(){
  let val = 100 * (this.totalAmount/this.amountOfAllStudents)
  // console.log(val);
  return val ? Math.abs(val).toFixed(0) : 0
}
getPercentOfR(){
  let val = 100 * ((this.amountOfAllStudents-this.totalAmount)/this.amountOfAllStudents)
  // console.log(val);
  return val ? Math.abs(val).toFixed(0) : 0
}

navigateToPaymentDetails(date:string){
  this.route.navigate(['/payments'],{
  queryParams:{
    date:date
  },
  // queryParamsHandling:'merge'

})
}

/**
 * Period for the "paid expenses" page, matching what this page is showing:
 * the selected month of the selected year, the custom range if one was picked, or everything
 * (2000 → today) when the range picker was cleared. Dates are local calendar days, YYYY-MM-DD.
 */
paidExpensesParams(): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const local = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (!this.customPeriod) {
    const lastDay = new Date(this.currentYear, this.activeMonth, 0).getDate();
    return {
      from: `${this.currentYear}-${pad(this.activeMonth)}-01`,
      to: `${this.currentYear}-${pad(this.activeMonth)}-${pad(lastDay)}`,
    };
  }
  const range = this.date;
  if (Array.isArray(range) && range[0] instanceof Date && range[1] instanceof Date) {
    return { from: local(range[0]), to: local(range[1]) };
  }
  return { from: '2000-01-01', to: local(new Date()) };
}

handleChangeMonth(month: number) {
  this.customPeriod = false;
  this.activeMonth = month;
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
  this.getAllReports();
}

onChangeYear(year: Date) {
  this.customPeriod = false;
  this.currentYear = year.getFullYear();
  this.startDate = new Date(this.currentYear, this.activeMonth - 1, 0)
  .toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  .split('T')[0];
this.endDate = new Date(this.currentYear, this.activeMonth, 1)
  .toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  .split('T')[0];
this.getAllReports();

}

onChange(result: Date[]): void {
 this.customPeriod = true;
 if (result.length>0){
  this.startDate = result[0].toISOString().split('T')[0]
  this.endDate = result[1].toISOString().split('T')[0]
  this.getAllReports()
} else {
  this.startDate =""
  this.endDate = ""
  this.getAllReports()

}
}

getWeek(result: Date[]): void {
  // console.log('week: ', result.map(getISOWeek));
}
}

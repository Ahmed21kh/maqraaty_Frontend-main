import { StudentAvatarComponent } from '../../shared/components/student-avatar/student-avatar.component';
import { StudentSelectComponent } from '../../shared/components/student-select/student-select.component';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
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
  NgControl,
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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { EmptyPipe } from "../../shared/pipes/empty.pipe";
import { NzCardModule } from 'ng-zorro-antd/card';
import { Student_Names } from '../../core/models/app.model';
import { NzTagComponent } from "ng-zorro-antd/tag";
import { WhatsappSocketService } from '../../core/whatsapp/whatsapp-socket.service';


interface DataItem {
  _id: string;
  amount:number;
  student:string;
  date:Date;
  studentDetails:Student_Names;
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
    selector: 'app-payments',
    standalone: true,
    host: { ngSkipHydration: 'true' },
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.scss',
    imports: [
    StudentAvatarComponent,
    StudentSelectComponent,
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
    RouterModule,
    EmptyPipe,
    NzCardModule,
    NzTagComponent
]
})
export class PaymentsComponent implements OnInit {
  isVisible = false;
  isEdit = false;
  searchName:string ='';
  searchPhone:string = '';
  searchCode:string = '';
  studentId = '';
  paymentId:string = ''
  isDeleteModal = false;
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
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: false,
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
      name: 'المبلغ',
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend', null],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
    },

  ];
  pageSize:number = 100;
  pageNumber:number = 1;
  count!:number;
  total!:number
  totalPages!:number;
  loadingAdd: boolean = false;
  loadingAEdit: boolean = false;
  loadingSearch: boolean = false;
  loadingData: boolean = false;
  students_Name = (this.appService.ensureActiveNames(), this.appService.activeStudentsName);
  student_Data!:DataItem ;
  showStudent:boolean = false;
  nameContent!:string;
  dateFilter:string = new Date().toLocaleDateString("en-CA")
  editModal:boolean =false;
  subscriptionVal:number = 0
  defaultDate:any = new Date().toISOString().split("T")[0]
  totalAmount:number = 0
  payLoading:boolean=false;
  studentNameVal = signal('')
  private readonly whatsappService = inject(WhatsappSocketService);
  readonly bulkInProgress = this.whatsappService.bulkInProgress;
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: ApiService,
    private route: ActivatedRoute
    // private ngControl : NgControl
  ) {}
    paymentForm = this.fb.group({
      student:[null,[Validators.required]],
      amount:[null,[Validators.required]],
      date:[new Date().toLocaleDateString("en-CA"),[Validators.required]]
    })


  get pf() {
    return this.paymentForm.controls;
  }

  hasStudentError():boolean {
    return this.pf.student.errors?.['required']&&this.pf['student'].touched;
  }

  hasAmountError():boolean {
    return this.pf.amount.errors?.['required']&&this.pf['amount'].touched;
  }
  // @Input() set disableControl( condition : boolean ) {
  //   const action = condition ? 'disable' : 'enable';
  //   this.ngControl.control![action]();
  // }

  compareDate(date:any){
    let val = date !== new Date().toLocaleDateString("en-CA")
   return val
  }
 closeShowStudent(){
  this.showStudent = false;
 }
 Val(id:string){
  let student = this.students_Name().find(data => data._id == id)?.name
  return student
 }

  resetData() {
    this.paymentForm.reset({
      amount:null,
      date:new Date().toISOString().split("T")[0],
      student:null
    })
    this.paymentId = ''
    this.subscriptionVal = 0
  }

  onChange(result: Date): void {
    if (result !== null) {
      this.dateFilter = result.toISOString().split("T")[0]
      this.getDataOfPayments()

    } else {
      this.dateFilter = new Date().toISOString().split("T")[0]
      this.getDataOfPayments()
    }
  }

  async getDataOfPayments() {
    const date = this.route.snapshot.queryParamMap.get('date');
     if (date) {
      this.dateFilter = date;
     }
    this.loadingData = true
    this.appService.getPaymentData(this.pageNumber,this.pageSize,this.dateFilter).subscribe({
      next: async(data) => {
        // console.log(data);
        this.listOfData =await data.data;
        this.count = await data?.metaData?.count;
        this.totalPages = await data?.metaData?.totalPages
        this.total = await data?.metaData?.total
        this.totalAmount = await data?.metaData?.totalAmount
        this.loadingData = false

      },
      error: (err) => {
        this.msg.error(err.message)
      },
    });
  }


  // async getOneUser(Id:string){
  //   this.appService.getOne_student(Id).subscribe({
  //     next:async(data)=>{
  //       this.student_Data = await data;
  //     },
  //     error:(err)=>{
  //       this.msg.error(err.message)
  //     }
  //   })
  // }
  handleOpenConfirmDelete(id: any): void {
    this.paymentId = id;
    this.isDeleteModal = true;
  }

  handleCancelConfirmDelete(): void {
    this.isDeleteModal = false;
  }

  handleDelete() {
    this.isDeleteModal = false;
    this.appService
      .deletePayment(this.paymentId)
      .pipe(
        map(() => {
          // this.msg.loading("loading...")
        })
      )
      .subscribe({
        next: (response) => {
          this.msg.success('تم الحذف بنجاح');
          this.getDataOfPayments().then(() => {
            this.isDeleteModal = false;
          });
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
  }
  getSubscriptionVal(){
   this.paymentForm.value.student == null? this.paymentForm.controls.amount.disable({onlySelf:true,emitEvent:false}):this.paymentForm.controls.amount.enable({onlySelf:true,emitEvent:true})

  this.paymentForm.valueChanges.subscribe((res)=>{
    this.subscriptionVal = this.students_Name().find((d:any)=> d._id == res.student)?.amount || 0;

    if (this.subscriptionVal==null) {
     this.paymentForm.controls.amount.disable({onlySelf:true,emitEvent:false})
    } else {
     this.paymentForm.controls.amount.enable({onlySelf:true,emitEvent:true})

    }

   this.student_Data = this.students_Name().find((d:any)=> d._id == res.student) as any;

  })
  }
  submit(data:FormGroup){
    if (data.valid&&data.controls?.['amount'].valid) {
    this.payLoading = true;
    const { date , amount ,student} = data.value
    this.appService.addPayment({date:this.dateFilter,amount},student).subscribe({next:(data)=>{
      this.confirmPay(this.student_Data);
      this.msg.success("تم الدفع بنجاح")
      this.getDataOfPayments()
      this.resetData()
      this.payLoading = false;
      },
    error:(errr)=>{
      this.msg.error(errr.message);
    }
    })
  } else {
    data.markAllAsTouched()
  }

  }

  selectStudent(value: any) {

    // this.studentNameVal.set(value ?? '');
  }

  ngOnInit(): void {
    this.getDataOfPayments();
    this.getSubscriptionVal();

  }
  changePagination (e:any) {
  this.pageNumber = e
  this.getDataOfPayments();

  }
  showModal(): void {
    this.isVisible = true;
    this.isEdit = false;
  }
  showEditModal(id:string,sId:string){
    this.paymentId = id;
    this.studentId = sId;
    this.editModal = true;
  }
  cancelEditModal(){
    this.editModal = false;
    this.resetData()
  }

updatePayment(){
 this.appService.updatePayment(this.paymentId,{...this.paymentForm,student:this.studentId}).subscribe({
  next:async(data)=>{
    this.getDataOfPayments().then(data => {
      this.msg.success("payment updated successfully")
      this.editModal = false;
      this.resetData()
    })

  },
  error:(err)=> {
   this.msg.error(err.message)
  },
 })
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


validate(){
    this.paymentForm.controls.amount.markAllAsTouched()
    this.paymentForm.controls.date.markAllAsTouched()
  }




}

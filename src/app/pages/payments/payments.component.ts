import { Component, Input, OnInit } from '@angular/core';
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
  NgControl,
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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { EmptyPipe } from "../../pipes/empty.pipe";
import { NzCardModule } from 'ng-zorro-antd/card';

interface Student_Names {
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
        RouterModule,
        EmptyPipe,
        NzCardModule
    ]
})
export class PaymentsComponent {
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
  students_Name: Student_Names[] = [];
  student_Data!:DataItem ;
  showStudent:boolean = false;
  nameContent!:string;
  dateFilter:string = new Date().toLocaleDateString("en-CA")
  editModal:boolean =false;
  subscriptionVal:number = 0
  defaultDate:any = new Date().toISOString().split("T")[0]
  totalAmount:number = 0
  payLoading:boolean=false;
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: AappServiceService,
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
  // @Input() set disableControl( condition : boolean ) {
  //   const action = condition ? 'disable' : 'enable';
  //   this.ngControl.control![action]();
  // }

  compareDate(date:any){
    console.log(date == new Date().toISOString().split("T")[0]);
    console.log(date);
    console.log(new Date().toISOString().split("T")[0]);
    let val = date !== new Date().toLocaleDateString("en-CA")
    console.log(val);
   return val
  }
 closeShowStudent(){
  this.showStudent = false;
 }
 studentName(id:string){
  let student = this.students_Name.filter(data => data._id == id)[0]?.name
  return student
 }
 getNameOfOneStudent(id:string){
  let student = this.students_Name.filter(data => data._id == id)[0]?.name;
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
    console.log('onChange: ', result);
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
     console.log(date);
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
        console.log(err);
        this.msg.error(err.message)
      },
    });
  }

  async getStudentsName(){
    this.appService.getStudents_names('active').subscribe({
      next:async(data)=>{
        this.students_Name = await data;
      },
      error:(err)=>{
        this.msg.error(err.message)
      }
    })
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
   console.log(this.paymentForm.value);

  this.paymentForm.valueChanges.subscribe((res)=>{
    this.subscriptionVal = this.students_Name.filter((d:any)=> d._id == res.student)[0]?.amount
    console.log(this.subscriptionVal);

    if (this.subscriptionVal==null) {
     this.paymentForm.controls.amount.disable({onlySelf:true,emitEvent:false})
     console.log("null ====>",res);
     console.log(this.paymentForm.value);
    } else {
     this.paymentForm.controls.amount.enable({onlySelf:true,emitEvent:true})
     console.log(this.paymentForm.controls.amount.valid);
     console.log(this.paymentForm.controls.amount.disabled);

     console.log("not null ====>",res);
     console.log(this.paymentForm.value);
    }

   console.log(this.students_Name.filter((d:any)=> d._id == res.student));

  })
  }
  submit(data:FormGroup){
    console.log(data.errors);
    console.log(data.valid);
    console.log(data.controls?.['amount'].valid);
    if (data.valid&&data.controls?.['amount'].valid) {
    console.log(data.value);
    this.payLoading = true;
    const { date , amount ,student} = data.value
    this.appService.addPayment({date:this.dateFilter,amount},student).subscribe({next:(data)=>{
      console.log(data);
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
  ngOnInit(): void {
    this.getDataOfPayments();
    this.getStudentsName()
    this.getSubscriptionVal();

  }
  changePagination (e:any) {
  console.log(e);
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





  validate(){
    this.paymentForm.controls.amount.markAllAsTouched()
    this.paymentForm.controls.date.markAllAsTouched()
  }




}

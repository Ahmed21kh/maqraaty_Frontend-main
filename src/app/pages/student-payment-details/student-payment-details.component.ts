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
import { ActivatedRoute } from '@angular/router';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
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
  age:any;
  study_year:string,
  has_relative:string;
  relative:string[];
  is_payment:string;
  is_Azhar:string;
  landline: string;
  address: string;
  notes: string;
  date:Date,
  amount:any
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
    selector: 'app-student-payment-details',
    standalone: true,
    host: { ngSkipHydration: 'true' },
    templateUrl: './student-payment-details.component.html',
    styleUrl: './student-payment-details.component.scss',
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
        NzSpinModule,
        NzSkeletonModule,
        EmptyPipe,
        NzCardModule
    ]
})
export class StudentPaymentDetailsComponent {
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
  dateFilter:string = new Date().toISOString().split("T")[0]
  editModal:boolean =false;
  subscriptionVal:number = 0
  defaultDate:any= new Date().toISOString().split("T")[0]
  totalAmount:number = 0
  studentDetails!:Student_Names
  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: AappServiceService,
    private route:ActivatedRoute
    // private ngControl : NgControl
  ) {}
    paymentForm = this.fb.group({
      student:[null,[Validators.required]],
      amount:[null,[Validators.required]],
      date:[new Date().toISOString().split("T")[0],[Validators.required]]
    })

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
  // @Input() set disableControl( condition : boolean ) {
  //   const action = condition ? 'disable' : 'enable';
  //   this.ngControl.control![action]();
  // }
 closeShowStudent(){
  this.showStudent = false;
 }
 studentName(id:string){
  let student = this.students_Name.filter(data => data._id == id)[0]?.name
  return student
 }
 getNameOfOneStudent(id:string){
  let student = this.students_Name.filter(data => data._id == id)[0].name;
  return student
 }
 resetDataForm() {
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

  this.arr_phone_1.reset([''])
  this.arr_phone_2.reset([''])
  this.arr_phone_3.reset([''])
  this.arr_relative.reset([''])

  // this.arr_phone_1.push(new FormControl(''))
  // this.arr_phone_3.push(new FormControl(''))
  // this.arr_phone_3.push(new FormControl(''))
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
    const studentId = this.route.snapshot.paramMap.get('id')
    this.loadingData = true
    this.appService.getOnePaymentData(this.pageNumber,this.pageSize,studentId).subscribe({
      next: async(data) => {
        // console.log(data);
        this.listOfData =await data.data;
        this.count = await data?.metaData?.count;
        this.totalPages = await data?.metaData?.totalPages
        this.total = await data?.metaData?.total
        this.totalAmount = await data?.metaData?.totalAmount
        this.studentDetails = await data?.metaData?.studentDetails

        this.loadingData = false

      },
      error: (err) => {
        console.log(err);
        this.msg.error(err.message)
      },
    });
  }

  async getStudentsName(){
    this.appService.getStudents_names().subscribe({
      next:async(data)=>{
        this.students_Name = await data;
      },
      error:(err)=>{
        this.msg.error(err.message)
      }
    })
  }

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
    const { date , amount ,student} = data.value
    this.appService.addPayment({date,amount},student).subscribe({next:(data)=>{
      console.log(data);
      this.msg.success("تم الدفع بنجاح")
      this.getDataOfPayments()
      this.resetData()
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
    this.getSubscriptionVal()
  }
  changePagination (e:any) {
  console.log(e);
  this.pageNumber = e
  this.getDataOfPayments();

  }
  showModal(): void {
    this.isVisible = true;
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

handleOpenEditModal(data: Student_Names) {
  this.studentId = data?._id;
  this.isEdit = true;
  this.isVisible = true;
  this.myForm.setValue({
    name: data.name,
    phone_1: data.phone_1,
    phone_2: data.phone_2,
    phone_3: data.phone_3,
    age:data.age,
    study_year:data.study_year,
    has_relative:data.has_relative,
    relative:data.relative,
    is_payment:data.is_payment,
    is_Azhar:data.is_Azhar,
    landline: data.landline,
    address: data.address,
    image: data.image,
    notes: data.notes,
    date:data.date,
    amount:data.amount
  });
}
validateForm(){
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
  this.arr_phone_1.controls.map(data => data.markAllAsTouched())
  this.arr_phone_2.controls.map(data => data.markAllAsTouched())
  this.arr_phone_3.controls.map(data => data.markAllAsTouched())

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
    this.arr_relative.push(formControl2)
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
handleSubmitEdit() {
  if (this.myForm.value.has_relative == "نعم") {

    this.arr_relative.controls.map(data => data.markAllAsTouched())
  }else {
    this.arr_relative.controls.map(data => data.clearValidators())

  }
  if (this.myForm.valid) {
    console.log('Button ok clicked!');

    console.log(this.myForm.value);
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
          console.log(data);

          this.msg.success('تم التحديث بنجاح');
          this.loadingAEdit = false;
          this.getDataOfPayments().then(() => {
            this.resetDataForm();
            this.isVisible = false;
            this.isEdit = false;
          });
        },
        error: (err) => {
          this.msg.error(err.message);
        },
      });
  } else {
    this.validateForm()
  }
}

handleCancel(): void {
  console.log('Button cancel clicked!');
  this.isVisible = false;
  this.loadingAdd = false;
  this.loadingAEdit = false;
  this.resetDataForm();
}
handleChange({ file, fileList }: NzUploadChangeParam): void {
  const status = file.status;
  console.log(file);
  if (status !== 'uploading') {
    console.log(file, fileList);
  }
  if (status === 'done') {
    this.msg.success(`${file.name} file uploaded successfully.`);
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
      date: new Date() ||null,
      amount:this.myForm.value.amount || null
    });
  } else if (status === 'error') {
    this.msg.error(`${file.name} file upload failed.`);
  }
}




  validate(){
    this.paymentForm.controls.amount.markAllAsTouched()
    this.paymentForm.controls.date.markAllAsTouched()
  }


}

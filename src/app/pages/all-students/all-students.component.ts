import { Component, OnInit } from '@angular/core';
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
import { environment } from '../../../environments/environment.development';
import { EmptyPipe } from '../../pipes/empty.pipe';
import { OrderByPipe } from "../../pipes/order-by/order-by.pipe";
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
export interface DataItem {
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
  amount:any,
  active_status?:string
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
  selector: 'app-all-students',
  standalone: true,
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
            EmptyPipe,
            OrderByPipe,
            NzToolTipModule,
            NzSpinModule,
            NzCardModule,
            NzTagModule
  ],
  templateUrl: './all-students.component.html',
  styleUrl: './all-students.component.scss'
})
export class AllStudentsComponent {
 isVisible = false;
  isEdit = false;
  searchName:string ='';
  searchPhone:string = '';
  searchCode:string = '';
  searchStatus:string = '';
  studentId = '';
  isDeleteModal = false;
  listOfData: DataItem[] = [];
  url: string = environment.apiUrl
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
      name: 'الحالة',
      sortOrder: null,
      sortFn: null,
      sortDirections: [null],
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
  loadingDelete:boolean = false;
  isDeActivate:boolean = false;
  loadingDeactivate:boolean = false;
  totalAmount: number = 0;
  activatedDaate:Date = new Date();

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: AappServiceService
  ) {}

  passForm = this.fb.group({
    password:[null,[Validators.required,Validators.pattern("3333")]]
  });

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
 get passf(){
  return this.passForm.controls;
 }
  paymentForm = this.fb.group({
    amount:[0 ]
  })
 openShowStudent(data:DataItem){
  // this.getOneUser(id).then(()=>{
    this.student_Data = data;
    this.showStudent = true;
  // })
 }
 closeShowStudent(){
  this.showStudent = false;
 }
 getNameOfOneStudent(id:string){
  let student = this.students_Name.filter(data => data._id == id)[0]?.name;
  return student
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
   handleSearchQuery(){
    console.log(this.searchStatus);

    let x = "";
    if (this.searchName) {
      x += `&name=${this.searchName?.trim()?.toLowerCase()}`;
    }
    if (this.searchCode) {
      x += `&code=${this.searchCode?.trim()}`;
    }
    if (this.searchPhone) {
      x += `&phone=${this.searchPhone?.trim()}`;
    }
    if (this.searchStatus) {
      x += `&status=${this.searchStatus}`;
    }
    console.log(x);
    this.getDataOfStudents(x);
  };
  async getDataOfStudents(x:any='') {
    this.loadingData = true
    this.appService.getAllStudents(this.pageNumber,this.pageSize,x).subscribe({
      next: async(data) => {
        // console.log(data);
        this.listOfData =await data.data;
        this.count = await data?.metaData?.count;
        this.totalPages = await data?.metaData?.totalPages
        this.total = await data?.metaData?.total
        this.totalAmount = await data?.totalAmount[0]?.total;
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

  async getOneUser(Id:string){
    this.appService.getOne_student(Id).subscribe({
      next:async(data)=>{
        this.student_Data = await data;
      },
      error:(err)=>{
        this.msg.error(err.message)
      }
    })
  }

  ngOnInit(): void {
    this.getDataOfStudents();
    this.getStudentsName()
  }
  changePagination (e:any) {
  console.log(e);
  this.pageNumber = e
  this.getDataOfStudents();

  }
  showModal(): void {
    this.isVisible = true;
    this.isEdit = false;
  }

    handleOpenConfirmDelete(id: any): void {
      this.studentId = id;
      this.isDeleteModal = true;
    }

    handleCancelConfirmDelete(): void {
      this.isDeleteModal = false;
      this.studentId = '';
    }


    handleOpenConfirmDeActivate(id: any): void {
      this.studentId = id;
      this.isDeActivate = true;
    }

    handleCancelConfirmDeActivate(): void {
      this.isDeActivate = false;
      this.studentId = '';
    }
    handleDelete_student() {
    // this.isDeleteModal = false;
    this.loadingDelete = true;
    this.appService
      .delete_student(this.studentId)
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
            this.loadingDelete = false;
          });
        },
        error: (err) => {
          this.msg.error(err.message);
          this.loadingDelete = false;
        },
      });
    }

  handleActivate_deActivate_Student() {
    // this.isDeleteModal = false;
    this.loadingDeactivate = true;
    console.log(this.activatedDaate);

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
  handleOk(): void {
    console.log(this.myForm.valid);
    console.log(this.myForm.errors);
    console.log(this.myForm.value);
    if (this.myForm.value.has_relative == "نعم") {

      this.arr_relative.controls.map(data => data.markAllAsTouched())
    }else {
      this.arr_relative.controls.map(data => data.clearValidators())

    }
    console.log(this.myForm.valid);

    if (this.myForm.valid) {
      console.log('Button ok clicked!');
      console.log(this.myForm.value);
      this.loadingAdd = true;
      this.appService.addStudent(this.myForm.value).subscribe({
        next: async(res) => {
          console.log(res);
        this.msg.success('تم الاضافة بنجاح');
        this.handleAddAttendance(res.data._id)
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
      this.validate()

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
    this.arr_phone_1.controls.map(data => data.markAllAsTouched())
    this.arr_phone_2.controls.map(data => data.markAllAsTouched())
    this.arr_phone_3.controls.map(data => data.markAllAsTouched())

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
            console.log(data);

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
      this.validate()
    }
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
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


  handleAddAttendance(id:string){
    console.log(id);

    let obj:AttendanceItem = {
      date:new Date().toUTCString(),
      status:'حاضر',
      attend_days_month:this.appService.getDatesAndDays()
    }
   this.appService.addAttendance(obj,id).subscribe({next:(res)=>{
     console.log(res);

   },error:(err)=>{
    this.msg.error(err.message)
   }})
  }
}

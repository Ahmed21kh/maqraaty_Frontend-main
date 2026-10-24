import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
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
import { OrderByPipe } from "../../shared/pipes/order-by/order-by.pipe";
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { EditStudentsModalComponent } from '../../shared/components/edit-students-modal/edit-students-modal.component';
import { DeleteStudentsModalComponent } from '../../shared/components/delete-students-modal/delete-students-modal.component';
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
            NzToolTipModule,
            NzSpinModule,
            NzCardModule,
            NzTagModule
  ],
  templateUrl: './all-students.component.html',
  styleUrl: './all-students.component.scss'
})
export class AllStudentsComponent implements OnInit {
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
  students_Name = (this.appService.ensureAllNames(), this.appService.allStudentsName);
  student_Data!:DataItem ;
  showStudent:boolean = false;
  editingStudent = false;
  @ViewChild(EditStudentsModalComponent) editForm?: EditStudentsModalComponent;
  nameContent!:string;
  loadingDelete:boolean = false;
  isDeActivate:boolean = false;
  loadingDeactivate:boolean = false;
  totalAmount: number = 0;
  activatedDaate:Date = new Date();

  constructor(
    private fb: FormBuilder,
    private msg: NzMessageService,
    private appService: ApiService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef
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

  closeShowStudent(){
  this.editingStudent = false;
    this.showStudent = false;
 }
 // O(1) id→name lookup (index rebuilt only when the students list instance changes)
 private readonly nameResolver = createNameResolver(() => this.students_Name());
 getNameOfOneStudent(id: string) {
   return this.nameResolver(id);
 }

   handleSearchQuery(){

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
        this.msg.error(err.message)
      },
    });
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
  }
  changePagination (e:any) {
  this.pageNumber = e
  this.getDataOfStudents();

  }
  showModal(): void {
    this.isVisible = true;
    this.isEdit = false;
  }

    handleOpenConfirmDelete(id: any): void {
      const modal = this.modal.create<DeleteStudentsModalComponent, any>({
        nzTitle: ' حذف الطالب',
        nzContent: DeleteStudentsModalComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzDraggable:true,
        nzData: {
          studentId: id,
        },
        nzAutofocus:'ok',
        nzDirection:'rtl',
        nzFooter: null
      });
      const instance = modal.getContentComponent();
      // Return a result when closed
      modal.afterClose.subscribe(result =>{
        if(result){
          this.getDataOfStudents();
        }
      });


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

  handleOpenEditModal(data: DataItem) {
    this.studentId = data?._id;
    // this.isEdit = true;
    // this.isVisible = true;
    const modal = this.modal.create<EditStudentsModalComponent, any>({
      nzTitle: 'تعديل بيانات الطالب',
      nzContent: EditStudentsModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzWidth: '700px',
      nzStyle: {
        // 'margin-top': '-38px'
      },
      nzDraggable:true,
      nzBodyStyle: {
        'overflow-y': 'auto',
        'max-height': '720px'
      },
      nzData: {
        studentsName: this.students_Name,
        studentId: data?._id,
        studentData: data
      },
      nzClassName:'edit-modal',
      nzDirection:'rtl',
      nzAutofocus:'ok',
      nzFooter: [
        {
          label:'تعديل',
          type:'primary',
          shape:'round',
          loading:(contentComponentInstance) => {
            return contentComponentInstance?.loadingAEdit || false
          },
          onClick:(contentComponentInstance) =>{
            contentComponentInstance?.handleSubmitEdit()
          }
        },
        {
          label:'الغاء',
          shape:'round',
          onClick:(contentComponentInstance) =>{
            contentComponentInstance?.handleCancel()
          }
        }
      ]
    });
    const instance = modal.getContentComponent();
    // Return a result when closed
    modal.afterClose.subscribe(result =>{
      instance.resetData()
      if(result){
        this.getDataOfStudents().then(() => {
        });
      }
    });

  }

  handleCancel(): void {
    this.isVisible = false;
  }

  handleAddAttendance(id:string){

    let obj:AttendanceItem = {
      date:new Date().toUTCString(),
      status:'حاضر',
      attend_days_month:this.appService.getDatesAndDays()
    }
   this.appService.addAttendance(obj,id).subscribe({next:(res)=>{

   },error:(err)=>{
    this.msg.error(err.message)
   }})
  }
}

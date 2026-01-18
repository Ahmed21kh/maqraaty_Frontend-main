import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [NzBreadCrumbModule,RouterModule],
  template: `
    <nz-breadcrumb>
      <nz-breadcrumb-item style="cursor: pointer;" [routerLink]="'/home'">الرئيسية</nz-breadcrumb-item>
    @for (item of routes_breadcrumb; track $index) {
      <nz-breadcrumb-item [routerLink]="item" >
       <a style="text-decoration: none;">{{breadcrumbNameMap[item]}}</a>
      </nz-breadcrumb-item>

    }
    @empty {
      <div></div>
    }
    </nz-breadcrumb>
  `,
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  routes_breadcrumb : string[] = [];
  paramsOuery:any = {};

  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.router.config
      console.log(params);
      if (params) {
        this.paramsOuery = params;
        console.log(this.paramsOuery);
      }

      // ... change the name of routes based on received parameters
    });
  }

  id:any = this.route.snapshot.paramMap.get('id')
   breadcrumbNameMap:any = {}
  @Output() dataFromChild = new EventEmitter<any>();
  public dataFromChild2 = new Subject<any>();
  dataFromChild$ = this.dataFromChild.asObservable();

  ngOnInit() {
    console.log(this.id);
    console.log(this.paramsOuery!['date']);
    this.breadcrumbNameMap = {
      '/registerd': 'الطلاب النشطين',
      '/payments': ' اليومية بالمقرأة',
      [`/payments?date=${this.paramsOuery!['date']}`]: ' اليومية بالمقرأة',
      '/student-subscription': ' الاشتراكات بالمقرأة',
      '/attendance': 'الحضور بالمقرأة',
     [`/student-account`]: 'حساب الطالب',
     [`/add-student`]: 'اضافة طالب',
     [`/reports`]: 'التقارير بالمقرأة',
     [`/edit-student/${this.id}`]: `${this.id}`,
     [`/edit-student`]: 'تعديل بيانات الطالب',
     [`/student-account/${this.id}`]:`${this.id}`,
     [`/in-active-students`]: 'الطلاب غير النشطين',
     [`/students-not-pay`]: ' اشتراكات لم تدفع',
     [`/all-students`]: 'الطلاب المسجلين',
    };
    console.log(this.breadcrumbNameMap);

    console.log(this.router.url?.split('/').filter((i) => i));
    this.dataFromChild.emit(this.router.url);
     this.dataFromChild2.next(this.router.url)
    const pathSnippets = this.router.url?.split('/').filter((i) => i)
    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      console.log(url);
      console.log(this.breadcrumbNameMap);
      return url
    });
    console.log(extraBreadcrumbItems);
   this.routes_breadcrumb = extraBreadcrumbItems

  }
}

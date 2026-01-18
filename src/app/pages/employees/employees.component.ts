import { Component } from '@angular/core';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [BreadcrumbComponent,RouterModule,NzTableModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {

}

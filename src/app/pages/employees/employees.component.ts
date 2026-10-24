import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [PageHeaderComponent,RouterModule,NzTableModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {

}

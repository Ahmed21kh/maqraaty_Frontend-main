import { Component, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { FormsModule } from '@angular/forms';
import { AappServiceService } from '../../services/aapp-service.service';
import { DataItem } from '../registered-students/registered-students.component';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { environment } from '../../../environments/environment';
import { RouterLink, RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { debounceTime, Subject, tap } from 'rxjs';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NzInputModule,
    NzButtonModule,
    NzFormModule,
    NzGridModule,
    NzImageModule,
    NzAutocompleteModule,
    FormsModule,
    NzMessageModule,
    NzIconModule,
    RouterLink,
    RouterModule,
    NzLayoutModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent implements OnInit {
  inputValue?: string;
  options: any[] = [];
  url: string = environment.apiUrl;
  studentsData: DataItem[] = [];
  private debouncedFilter$ = new Subject<string>();
  constructor(private appService:AappServiceService , private msg:NzMessageService) { }
 getAllStudentsData(){
  this.appService.getStudents_names().subscribe({next:async(res)=>{
    console.log(res);
    this.studentsData = await res;
    console.log(this.studentsData);
  },error:(err)=>{
    console.log(err);
    this.msg.error(err.message)

  }})
 }
  ngOnInit(): void {
    this.getAllStudentsData()
    this.debouncedFilter$.pipe(
      debounceTime(300),
      tap(value => {
        this.options = value? this.studentsData.filter(student => student.name.toLowerCase().includes(value.toLowerCase())): [];
      })
    ).subscribe();
  }

  onInput(event: Event): void {
    // const value = (event.target as HTMLInputElement).value;
    const inputElement = event.target as HTMLInputElement;
    this.debouncedFilter$.next(inputElement.value);
  }
}

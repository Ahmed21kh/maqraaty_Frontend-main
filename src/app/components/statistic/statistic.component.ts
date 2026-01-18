import { Component, Input, TemplateRef } from '@angular/core';
import { NgStyleInterface } from 'ng-zorro-antd/core/types';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzStatisticValueType } from 'ng-zorro-antd/statistic/typings';
import { NzCardModule } from 'ng-zorro-antd/card';
@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [
    NzStatisticModule,
    NzCardModule
  ],
  templateUrl: './statistic.component.html',
  styleUrl: './statistic.component.scss'
})
export class StatisticComponent {
 @Input() title!: TemplateRef<any>;
 @Input() value!: NzStatisticValueType;
 @Input() preffix!: TemplateRef<any>;
 @Input() suffix!: TemplateRef<any>;
 @Input() valueTemp!: TemplateRef<any>;
 @Input() style!: NgStyleInterface;
 @Input() class!: string;
 @Input() loading: boolean = false;



 }

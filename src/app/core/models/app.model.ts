import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from "ng-zorro-antd/table";
import { ACTUVE_STATUS } from "../enums/app-enums";

export interface Student_Names {
  _id:string;
  name:string;
  image:string
  code: number;
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
  amount:number;
  active_status:ACTUVE_STATUS;
}

export interface StudentItem {
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
  date:Date;
  amount:any;
  active_status:ACTUVE_STATUS;

}

export interface ColumnItem {
  name: string;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<StudentItem> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<StudentItem> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
}

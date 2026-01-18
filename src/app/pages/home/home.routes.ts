import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';


export const Home_ROUTES: Routes = [
  { path: '', component: HomeComponent , data:{home:true} },
];

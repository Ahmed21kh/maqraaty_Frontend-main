import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
  NavigationStart,
  Event as NavigationEvent,
} from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule } from 'ng-zorro-antd/table';
import { HttpClientModule } from '@angular/common/http';
import {
  NZ_CONFIG,
  NzConfig,
  NzConfigService,
} from 'ng-zorro-antd/core/config';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ThemeService } from './services/theme.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { BehaviorSubject } from 'rxjs';
import { AppInitializerProvider } from './app-initializer.service';
import { themeProviderFactory } from './theme.provider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzEmptyModule } from 'ng-zorro-antd/empty';


const ngZorroConfig: NzConfig = {
  theme: {
    primaryColor: '#f5f',
  },
};
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    RouterModule,
    BreadcrumbComponent,
    NzBreadCrumbModule,
    NzTableModule,
    HttpClientModule,
    NzButtonModule,
    NzCardModule,
    NzTypographyModule,
    NzAvatarModule,
    NzToolTipModule,
    NzEmptyModule
  ],
  providers: [AppInitializerProvider,{ provide: NZ_CONFIG, useValue: ngZorroConfig } ,
  {
    provide: 'themeService',
    useFactory: themeProviderFactory,
    deps: [ThemeService]
  }
],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  routeActive!: any;
  darkmode =  new BehaviorSubject(this.themeService.currentTheme.getValue())
  event$: any;
  paramsRoute: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nzConfigService: NzConfigService,
    private themeService: ThemeService,
    @Inject('themeService') private loadTheme: () => Promise<Event>
  ) {
    this.loadTheme().then(() => {
      this.darkmode.next(this.themeService.currentTheme.getValue())
    });
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      console.log(params);
      if (params['home']) {
        this.paramsRoute = params['home'];
      } else {
        this.paramsRoute = false;
      }
    });

    this.event$ = this.router.events.subscribe(
      async (event: NavigationEvent) => {
        if (event instanceof NavigationStart) {
          console.log(event.url);
          this.routeActive = event.url;
        }
      }
    );
    // this.router.navigate(['/registerd'])
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.darkmode.next(this.themeService.currentTheme.getValue());
  }
  onChangeConfig() {
    this.nzConfigService.set('theme', { primaryColor: 'red' });
  }

  ngOnDestroy() {
    this.event$.unsubscribe();
  }
  receiveData(data: any) {
    console.log(data);
  }
}

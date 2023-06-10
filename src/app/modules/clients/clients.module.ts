import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsRoutingModule } from './clients-routing.module';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { DynamicFormCreationComponent } from './components/dynamic-form-creation/dynamic-form-creation.component';
import { BillingComponent } from './components/billing/billing.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ServicesComponent } from './components/services/services.component';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { MatChipsModule } from '@angular/material/chips';
import { CanDeactivateGuard } from './guards/can-component-deactivate.guard';
import { NgxPaginationModule } from 'ngx-pagination';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [
    HomeComponent,
    NavbarComponent,
    SidenavComponent,
    DashboardComponent,
    DynamicFormCreationComponent,
    BillingComponent,
    UserDetailsComponent,
    UserTableComponent,
    ServicesComponent,
    ExpensesComponent,
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedModule,
    TimelineModule,
    CardModule,
    MatChipsModule,
    NgSelectModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot()
  ],
  providers: [CanDeactivateGuard]
})
export class ClientsModule { }

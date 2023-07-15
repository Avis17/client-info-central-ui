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
import { ExpensesComponent } from './components/expenses/expenses.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { BillBalanceTrackerComponent } from './components/bill-balance-tracker/bill-balance-tracker.component';
import { RebillComponent } from './components/rebill/rebill.component';
import { DragDropModule } from 'primeng/dragdrop';
import { CustomerFollowupComponent } from './components/customer-followup/customer-followup.component';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import {MatExpansionModule} from '@angular/material/expansion';
import { NewBillComponent } from './components/new-bill/new-bill.component';
import { TabViewModule } from 'primeng/tabview';
import { EmployeeManagementComponent } from './components/employee-management/employee-management.component';
import { EmployeeTableComponent } from './components/employee-table/employee-table.component';
import { TooltipModule } from 'primeng/tooltip';
import { EmployeeAttendanceComponent } from './components/employee-attendance/employee-attendance.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { EmployeePayslipsComponent } from './components/employee-payslips/employee-payslips.component';
import { CalendarModule } from 'primeng/calendar';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NotesComponent } from './components/notes/notes.component';
import { CreditPointManagementComponent } from './components/credit-point-management/credit-point-management.component';



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
    BillBalanceTrackerComponent,
    RebillComponent,
    CustomerFollowupComponent,
    NewBillComponent,
    EmployeeManagementComponent,
    EmployeeTableComponent,
    EmployeeAttendanceComponent,
    EmployeePayslipsComponent,
    NotesComponent,
    CreditPointManagementComponent,
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedModule,
    TimelineModule,
    CardModule,
    MatChipsModule,
    NgSelectModule,
    TagModule,
    DragDropModule,
    DropdownModule,
    ProgressBarModule,
    NgxDaterangepickerMd.forRoot(),
    MatExpansionModule,
    TabViewModule,
    TooltipModule,
    FullCalendarModule,
    CalendarModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300,
    })
  ],
  providers: [CanDeactivateGuard]
})
export class ClientsModule { }

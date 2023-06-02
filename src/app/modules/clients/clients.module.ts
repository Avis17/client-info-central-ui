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



@NgModule({
  declarations: [
  HomeComponent,
  NavbarComponent,
  SidenavComponent,
  DashboardComponent,
  DynamicFormCreationComponent,
  BillingComponent,
  UserDetailsComponent,
  UserTableComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedModule,
  ]
})
export class ClientsModule { }

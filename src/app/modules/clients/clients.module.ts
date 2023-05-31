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



@NgModule({
  declarations: [
  HomeComponent,
  NavbarComponent,
  SidenavComponent,
  DashboardComponent,
  DynamicFormCreationComponent,
  BillingComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    SharedModule,
  ]
})
export class ClientsModule { }

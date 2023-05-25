import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateUserAccessComponent } from './components/create-user-access/create-user-access.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { NavbarComponent } from './components/navbar/navbar.component'
import { SharedModule } from 'src/app/shared/shared/shared.module';



@NgModule({
  declarations: [
    DashboardComponent,
    CreateUserAccessComponent,
    ToolbarComponent,
    NavbarComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule
  ]
})
export class AdminModule { }

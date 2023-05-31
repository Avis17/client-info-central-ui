import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateUserAccessComponent } from './components/create-user-access/create-user-access.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { NavbarComponent } from './components/navbar/navbar.component'
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { CreateApplicationMetaComponent } from './components/create-application-meta/create-application-meta.component';
import { ModalComponent } from 'src/app/common/components/modal/modal.component';
import { ViewAppMetasComponent } from './components/view-app-metas/view-app-metas.component';
import { AccordionModule } from 'primeng/accordion';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ViewDetailedMetaComponent } from './components/view-detailed-meta/view-detailed-meta.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CreateUserAccessComponent,
    ToolbarComponent,
    NavbarComponent,
    CreateApplicationMetaComponent,
    ModalComponent,
    ViewAppMetasComponent,
    ViewDetailedMetaComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    AccordionModule,
    SplitButtonModule
  ],
  providers : [
  ]
})
export class AdminModule { }

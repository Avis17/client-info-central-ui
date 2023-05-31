import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateUserAccessComponent } from './components/create-user-access/create-user-access.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { CreateApplicationMetaComponent } from './components/create-application-meta/create-application-meta.component';
import { ViewAppMetasComponent } from './components/view-app-metas/view-app-metas.component';
import { ViewDetailedMetaComponent } from './components/view-detailed-meta/view-detailed-meta.component';

const routes:Routes = [
  {
    path : "",
    component : DashboardComponent,
    children : [
      {
        path : "tools",
        component : ToolbarComponent
      },
      {
        path : "register-user",
        component : CreateUserAccessComponent
      },
      {
        path : "create-app-meta",
        component : CreateApplicationMetaComponent
      },
      {
        path : "view-app-metas",
        component : ViewAppMetasComponent
      },
      {
        path : "view-meta-details/:id",
        component : ViewDetailedMetaComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }


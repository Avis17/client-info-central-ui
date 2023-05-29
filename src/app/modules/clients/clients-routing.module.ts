import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DynamicFormCreationComponent } from './components/dynamic-form-creation/dynamic-form-creation.component';

const routes:Routes = [
  {
    path : "",
    component : DashboardComponent,
    children : [
      {
        path : 'home',
        component : HomeComponent
      },
      {
        path : 'dynamic-forms',
        component : DynamicFormCreationComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }

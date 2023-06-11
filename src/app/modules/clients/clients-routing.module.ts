import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DynamicFormCreationComponent } from './components/dynamic-form-creation/dynamic-form-creation.component';
import { BillingComponent } from './components/billing/billing.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UserTableComponent } from './components/user-table/user-table.component';
import { ServicesComponent } from './components/services/services.component';
import { CanDeactivateGuard } from './guards/can-component-deactivate.guard';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { BillBalanceTrackerComponent } from './components/bill-balance-tracker/bill-balance-tracker.component';

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
        path : 'billing',
        component : BillingComponent
      },
      {
        path : 'clients',
        component : UserTableComponent
      },
      {
        path : 'dynamic-forms',
        component : DynamicFormCreationComponent
      },
      {
        path : 'services',
        component : ServicesComponent,
        canDeactivate: [CanDeactivateGuard]
      },
      {
        path : 'expenses',
        component : ExpensesComponent,
      }, 
      {
        path : 'balance',
        component : BillBalanceTrackerComponent,
      },
      {
        path : 'user-details/:id',
        component : UserDetailsComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }

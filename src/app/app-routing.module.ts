import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authenticationGuard } from './guards/authentication.guard';
import { LoginComponent } from './components/login/login.component';
import { clientGuard } from './guards/client.guard';
import { adminGuard } from './guards/admin.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component : LoginComponent },
  {
    path: 'client',
    canActivate: [authenticationGuard, clientGuard],
    loadChildren: () => import('./modules/clients/clients.module').then(m => m.ClientsModule)
  },
  {
    path: 'admin',
    canActivate: [authenticationGuard, adminGuard],
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  // { path: 'reset-password', component: ResetPasswordComponent },
  { path: '*', pathMatch: 'full', redirectTo: 'dashboard'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

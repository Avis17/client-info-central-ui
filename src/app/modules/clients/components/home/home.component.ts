import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],

})
export class HomeComponent {

  customers: any = [];
  cols: any = [];
  ref: DynamicDialogRef;
  userDetails : any;
  constructor(private authService: AuthGuardService, private router:Router, private navigationService:NavigationService) {
    // console.log(this.authService.getUserDetails())
    this.userDetails = this.authService.getUserDetails();
  }

  onAddUSer(){
    const commands = ['/client/dynamic-forms'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }

  
}

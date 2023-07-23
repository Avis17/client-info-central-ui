import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NavigationService } from 'src/app/services/navigation.service';
import { CommonService } from 'src/app/services/common.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CryptoService } from 'src/app/services/crypto.service';
import * as moment from 'moment';

@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.scss']
})
export class InventoryManagementComponent {
  isLoading: boolean = true;
  userDetails:any;
  itemsList:any = []
  cols:any = []
  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private errorHandlingService: ErrorHandlingService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.isLoading = false;
  }

  onAddNewItem(){

  }

  checkValidations(){
    
  }
}

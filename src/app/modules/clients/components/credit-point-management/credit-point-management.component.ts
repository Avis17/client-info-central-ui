import { Component } from '@angular/core';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { CommonService } from 'src/app/services/common.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { EntityService } from '../../services/entity.service';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-credit-point-management',
  templateUrl: './credit-point-management.component.html',
  styleUrls: ['./credit-point-management.component.scss']
})
export class CreditPointManagementComponent {
  creditNeeded: string = 'notNeeded';
  creditAmount: number;
  redemptionAmount: number;
  creditPointForm: FormGroup;
  creditOptions:any = [
    {
      name : 'Required'
    },
    {
      name : 'Not-Required'
    },
  ]
  creditBasedOnOptions:any = [
    {
      name : 'Total Bill Amount'
    }
  ]
  userDetails: any = {};
  isLoading: boolean = true;

  constructor(
    private authService: AuthGuardService,
    private cryptService: CryptoService,
    private appMetaService: AppMetaCreationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private entityService: EntityService,
    private navigationService: NavigationService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.creditPointForm = new FormGroup({
      isCreditPointOptionRequired : new FormControl(null, Validators.required),
      creditBasedOn : new FormControl([{value: this.creditBasedOnOptions, disabled: true}]),
      purchaseValueAmount: new FormControl(null, Validators.required),
      redemptionAmount: new FormControl(null, Validators.required)
    });
    this.getCreditDetails();
  }

  saveChanges() {
    if (this.creditPointForm.valid) {
     this.onUpdateCreditPoints();
    } else {
      this.creditPointForm.markAllAsTouched();
    }
  }

  onUpdateCreditPoints() {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'credit-details',
      "collectionData": {email : this.userDetails.app_meta_details.company_email, ...this.creditPointForm.value},
      "query" : {
        email : this.userDetails.app_meta_details.company_email
      }
    }
    this.isLoading = true;
    this.entityService.updateEntity(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        Swal.fire('Credit Details Updated!', '', 'success');
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getCreditDetails(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'credit-details',
      "queryData": {
        email : this.userDetails.app_meta_details.company_email
      }
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        if(res?.data?.length > 0){
          this.creditPointForm = new FormGroup({
            isCreditPointOptionRequired : new FormControl(res.data[0].isCreditPointOptionRequired, Validators.required),
            creditBasedOn : new FormControl([{value: this.creditBasedOnOptions, disabled: true}]),
            purchaseValueAmount: new FormControl(res.data[0].purchaseValueAmount, Validators.required),
            redemptionAmount: new FormControl(res.data[0].redemptionAmount, Validators.required)
          });
        }
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onPreviousPage(){
    const commands = ['/client/clients'];
    this.navigationService.navigateWithoutLocationChange(commands)
  }
}

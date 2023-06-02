import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CryptoService } from 'src/app/services/crypto.service';
import { EntityService } from '../../services/entity.service';
import { CommonService } from 'src/app/services/common.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {

  userId = "";
  entitySchema: any = {}
  userDetails : any = {}
  clientInfo:any = {};
  clientInfoKeys:any = []
  constructor(
    private activatedRoute: ActivatedRoute,
    private cryptoService: CryptoService,
    private entityService: EntityService,
    private commonService: CommonService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService,
    private authenticationService:AuthGuardService
  ) {
    this.userDetails = this.authenticationService.getUserDetails();
    this.entitySchema = entityService.getEntitySchema();
    this.userId = this.activatedRoute.snapshot.paramMap.get('id') || '';
    this.userId = decodeURIComponent(this.userId)
    if (this.userId) {
      this.userId = this.cryptoService.decrypt(this.userId);
      this.userId = JSON.parse(this.userId)
    }
    this.getUserDetails();
  }

  getUserDetails() {
    const formData = {
      "schema": this.entitySchema,
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.dbName) || '',
      "collectionName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.customerCollectionName) || '',
      "queryData": this.userId
    }
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
        console.log(res)
        this.clientInfo = res.data[0];
        this.clientInfoKeys = this.userDetails?.app_meta_details?.table_fileds?.map((data:any)=>{
          return {field_name:data.field_name, field_key:data.field_key}
        })
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onPreviousPage() {
    const commands = ['/client/home'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }

  isArrayCheck(fieldValue: any) {
    if (Array.isArray(fieldValue)) {
      return true;
    }
      return false;
  }
}

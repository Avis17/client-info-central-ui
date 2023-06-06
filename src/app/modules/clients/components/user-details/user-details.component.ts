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
  inVoicesList : any = []
  listOfServices : any = []
  newInvoice  = false;
  searchItem : string = ''
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
    this.getInvoiceDetails();
  }

  getUserDetails() {
    const formData = {
      "schema": {},
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
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

  getInvoiceDetails(queryData?:any){
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "queryData": this.userId
    }
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
       this.inVoicesList = res.data;
       console.log(this.inVoicesList)
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

  onAddNewInvoice(){
    this.entityService.setinvoiceDetails({...this.clientInfo, services : this.listOfServices})
    this.navigationService.navigateWithoutLocationChange(['client/billing']);
  }

  onServiceOptionChange(event:any, selectedObj:any){
    if(event.target.checked){
      this.listOfServices.push({...selectedObj, createdAt : new Date()})
    }else{
      this.listOfServices = this.listOfServices.filter((data:any)=>{
        return data.service_name != selectedObj.service_name
      })
    }
  }
}

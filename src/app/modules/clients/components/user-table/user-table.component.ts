import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/services/navigation.service';
import { CommonService } from 'src/app/services/common.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { Table } from 'primeng/table'
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent {

  entities: any = [];
  cols: any = [];
  ref: DynamicDialogRef;
  userDetails: any;
  entitySchema: any = [];
  @ViewChild('tableref') dt: Table | any;

  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private commonService: CommonService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService,
    private cryptoService:CryptoService
  ) {
    this.userDetails = this.authService.getUserDetails();
    console.log(this.userDetails)
  }
  ngOnInit() {
    this.iterateTableFields();
    this.getAllEntity();
  }

  createCols() {
    this.cols = this.userDetails?.app_meta_details?.table_fileds.map((obj: any) => {
      return {
        header: obj.field_name,
        field: obj.field_key
      }
    })
    this.cols.push({
      header: "Created At",
      field: 'createdAt'
    })
  }

  iterateTableFields() {
    for (const field of this.userDetails?.app_meta_details?.table_fileds) {
      this.createEntitySchema(field);
    }
  }

  createEntitySchema(field: any) {
    let schema = {
      [field.field_key]: {
        type: this.commonService.toTitleCase(field.field_value) || 'Mixed',
        required: field.isRequired || true,
        unique: field.isUnique || false,
      }
    }
    this.entitySchema.push(schema);
  }

  isArrayCheck(field: any) {
    if (Array.isArray(this.entities[0][field])) {
      return true;
    }
      return false;
  }

  onNavClick(id:any, field:any){
    let encryptedId = this.cryptoService.encrypt(JSON.stringify({[field]:id}));
    encryptedId = encodeURIComponent(encryptedId);
    this.entityService.setEntitySchema(this.entitySchema);
    const commands = ['/client/user-details/'+encryptedId];
    this.navigationService.navigateWithoutLocationChange(commands)
  }

  applyFilterGlobal($event: any, stringVal: string) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  getAllEntity() {
    const formData = {
      "schema": this.entitySchema,
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.dbName) || 'kuat-technologies',
      "collectionName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.customerCollectionName) || 'students',
      "queryData": {}
    }
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
        console.log(res)
        this.entities = res.data;
        this.createCols();
        console.log(this.cols)
      }
    }, (err:any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onAddUSer() {
    const commands = ['/client/dynamic-forms'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }
}

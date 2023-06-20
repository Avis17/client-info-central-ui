import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent implements OnChanges, OnDestroy {

  entities: any = [];
  cols: any = [];
  ref: DynamicDialogRef;
  userDetails: any;
  entitySchema: any = [];
  @Input() queryData: any;
  @Input() tableData: any;
  isLoading:boolean  = true;

  @ViewChild('tableref') dt: Table | any;

  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService,
    private cryptoService: CryptoService
  ) {
    this.userDetails = this.authService.getUserDetails();
    console.log(this.userDetails)
  }
  ngOnInit() {
    // this.iterateTableFields();
    this.entityService.tableData$.subscribe((data:any) => {
      this.tableData = data;
      console.log(data)
    });
    if(!this.tableData){
      this.getAllEntity();
    }else{
      this.entities = this.tableData;
      this.createCols();
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.entityService.updateTableData(null);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.tableData) {
      this.isLoading = false;
      this.entities = JSON.parse(this.tableData);
      this.createCols();
    } else if (history.state && history.state.tableData) {
      this.isLoading = false;
      this.entities = JSON.parse(history.state.tableData);
      this.createCols();
    }
  }

  isDateField(value: any): boolean {
    if (typeof value !== 'string') {
      return false; // Return false if the value is not a string
    }
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }


  createCols() {
    this.cols = []
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

  onNavClick(id: any, field: any) {
    let encryptedId = this.cryptoService.encrypt(JSON.stringify({ [field]: id }));
    encryptedId = encodeURIComponent(encryptedId);
    this.entityService.setEntitySchema(this.entitySchema);
    const commands = ['/client/user-details/' + encryptedId];
    this.navigationService.navigateWithoutLocationChange(commands)
  }

  applyFilterGlobal($event: any, stringVal: string) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  getAllEntity(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        this.cols = [];
        this.entities = [];
        this.entities = res.data;
        this.createCols();
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onAddUSer() {
    const commands = ['/client/dynamic-forms'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }
}

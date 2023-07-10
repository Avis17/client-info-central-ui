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
import { ExcelService } from '../../services/excel.service';

@Component({
  selector: 'app-employee-table',
  templateUrl: './employee-table.component.html',
  styleUrls: ['./employee-table.component.scss']
})
export class EmployeeTableComponent implements OnInit{

  entities: any = [];
  cols: any = [];
  ref: DynamicDialogRef;
  userDetails: any;
  entitySchema: any = [];
  isLoading:boolean  = true;
  isPrevPage : boolean = false;
  @ViewChild('tableref') dt: Table | any;

  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private excelService: ExcelService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService,
    private cryptoService: CryptoService
  ) {
    this.userDetails = this.authService.getUserDetails();
    console.log(this.userDetails)
    this.isLoading = false
  }

  ngOnInit(): void {
    this.getAllEmployees();  
  }

  onPreviousPage(){
    const commands = ['/client/employee'];
    this.navigationService.navigateWithoutLocationChange(commands)
  }

  applyFilterGlobal($event: any, stringVal: string) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  onAddEmployee(){
    const commands = ['/client/dynamic-forms'];
    this.entityService.setFormType("employees")
    this.navigationService.navigateWithoutLocationChange(commands);
  }

  getAllEmployees(query?: any){
      const formData = {
        "schema": '',
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
        "collectionName": 'employees',
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

  createCols() {
    this.cols = []
    this.cols = this.userDetails?.app_meta_details?.employee_fields.map((obj: any) => {
      return {
        header: obj.field_name,
        field: obj.field_key
      }
    })
    this.cols.unshift({
      header: "Employee ID",
      field: 'empId'
    })
    this.cols.unshift({
      header: "Created At",
      field: 'createdAt'
    })
  }

  isArrayCheck(field: any) {
    if (Array.isArray(this.entities[0][field])) {
      return true;
    }
    return false;
  }

  onNavClick(id: any, field: any) {
    this.entityService.setFormType("employees")
    let encryptedId = this.cryptoService.encrypt(JSON.stringify({ [field]: id }));
    encryptedId = encodeURIComponent(encryptedId);
    this.entityService.setEntitySchema(this.entitySchema);
    const commands = ['/client/user-details/' + encryptedId];
    this.navigationService.navigateWithoutLocationChange(commands)
  }

  isDateField(value: any, col:string): boolean {
    if (typeof value !== 'string' || col == 'empId') {
      return false; // Return false if the value is not a string
    }
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  onAddAttendance(){
    const commands = ['/client/employee-attendance'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }

}

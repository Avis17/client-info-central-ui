import { Component, OnInit, Input } from '@angular/core';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { CommonService } from 'src/app/services/common.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { EntityService } from '../../services/entity.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ExcelService } from '../../services/excel.service';

@Component({
  selector: 'app-employee-payslips',
  templateUrl: './employee-payslips.component.html',
  styleUrls: ['./employee-payslips.component.scss']
})
export class EmployeePayslipsComponent implements OnInit{

  currentPage = 1;
  itemsPerPage = 5;
  payslipsList:any = [];
  isLoading: boolean = true;
  userDetails: any = {};
  @Input() empId:any;

  constructor(
    private authService: AuthGuardService,
    private cryptService: CryptoService,
    private appMetaService: AppMetaCreationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private excelService: ExcelService,
    private entityService: EntityService
  ) {
    this.userDetails = this.authService.getUserDetails();
  }

  ngOnInit(): void {
    this.getPayslips({empId:this.empId});
  }

  get pagedServicesList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.payslipsList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onDownload(payslip: any) {
    
  }

  onDelete(payslip: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employee-payslips',
      "queryData": {}
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.entityService.deleteEntityById(payslip._id, formData).subscribe((res: any) => {
          this.isLoading = false;
          if (res.status == 200) {
            Swal.fire('Payslip Successfully deleted!', '', 'success').then(() => {
              this.getPayslips({empId:this.empId});
            })
          }
        }, (err: any) => {
          this.isLoading = false;
          this.errorHandlingService.errorAlertMsg(err);
        })
      }
    })
  }


  getPayslips(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employee-payslips',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        this.payslipsList = res.data;
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CryptoService } from 'src/app/services/crypto.service';
import { EntityService } from '../../services/entity.service';
import { CommonService } from 'src/app/services/common.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ExcelService } from '../../services/excel.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {

  userId = "";
  entitySchema: any = {}
  userDetails: any = {}
  clientInfo: any;
  clientInfoKeys: any = []
  inVoicesList: any = []
  listOfServices: any = []
  newInvoice = false;
  searchItem: string = ''
  servicesList: any = []
  totalRevenue: number = 0;
  isLoading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cryptoService: CryptoService,
    private entityService: EntityService,
    private commonService: CommonService,
    private excelService: ExcelService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService,
    private authenticationService: AuthGuardService
  ) {
    this.userDetails = this.authenticationService.getUserDetails();
    this.entitySchema = entityService.getEntitySchema();
    this.userId = this.activatedRoute.snapshot.paramMap.get('id') || '';
    this.userId = decodeURIComponent(this.userId)
    if (this.userId) {
      this.userId = this.cryptoService.decrypt(this.userId);
      this.userId = JSON.parse(this.userId)
    }
    this.getAllAggregateDatas();
  }

  flattenArray(arr: any) {
    return arr.flat(Infinity);
  }

  getAllAggregateDatas(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": this.userId
    }
    this.isLoading = true;

    this.entityService.getAllAggregateDatas(formData).subscribe((res: any) => {
      this.isLoading = false;

      if (res?.data) {
        console.log(res)
        this.clientInfo = res.data.customersList[0];
        this.clientInfoKeys = this.userDetails?.app_meta_details?.table_fileds?.map((data: any) => {
          return { field_name: data.field_name, field_key: data.field_key }
        })
        if (res.data.invoicesList[0]) {
          this.servicesList = this.flattenArray(res.data.products[0]);
          this.totalRevenue = res.data.totalRevenue;
          this.inVoicesList = res.data.invoicesList[0].reverse();
          this.inVoicesList = this.inVoicesList.map((data: any) => {
            return {
              ...data,
              createdAt: this.formatDate(data.createdAt)
            }
          })
        } else {
          this.inVoicesList = []
        }

      }
    }, (err: any) => {
      this.isLoading = false;
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

  onAddNewInvoice() {
    if (this.listOfServices.length > 0) {
      this.entityService.setinvoiceDetails({ ...this.clientInfo, services: this.listOfServices })
      this.navigationService.navigateWithoutLocationChange(['client/billing']);
    }
  }

  onDownloadBill(data: any) {
    this.entityService.setinvoiceDetails(data);
    this.navigationService.navigateWithoutLocationChange(['client/bill-download']);
  }

  getDate(now: any) {
    if (now) {
      now = new Date(now);
      return now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();
    }
    return ''
  }

  onServiceOptionChange(event: any, selectedObj: any) {
    if (event.target.checked) {
      this.listOfServices.push({ ...selectedObj, createdAt: new Date() })
    } else {
      this.listOfServices = this.listOfServices.filter((data: any) => {
        return data.service_name != selectedObj.service_name
      })
    }
  }


  formatDate(dateString: any) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  onClickCardBox(cardName: any) {
    console.log(cardName)
    switch (cardName) {
      case 'products':
        this.exportAsXLSX(this.servicesList, cardName);
        break;
      case 'invoices':
        this.exportAsXLSX(this.inVoicesList, cardName);
        break;
      default:
        Swal.fire("Invalid Card Item Clicked!");
    }
  }

  exportAsXLSX(data: any, filename: any): void {
    this.excelService.exportAsExcelFile(data, filename);
  }
}

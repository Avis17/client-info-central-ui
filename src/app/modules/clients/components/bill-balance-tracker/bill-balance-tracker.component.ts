import { Component } from '@angular/core';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { CommonService } from 'src/app/services/common.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { EntityService } from '../../services/entity.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { NavigationService } from 'src/app/services/navigation.service';
import { ExcelService } from '../../services/excel.service';

@Component({
  selector: 'app-bill-balance-tracker',
  templateUrl: './bill-balance-tracker.component.html',
  styleUrls: ['./bill-balance-tracker.component.scss']
})
export class BillBalanceTrackerComponent {
  balanceList: any = []
  searchText: any = '';
  currentPage = 1;
  itemsPerPage = 10;
  userDetails: any = {};
  Query: any = {};
  isLoading: boolean = true;
  billTypes: any = [
    {
      label: 'All Invoices'
    },
    {
      label: 'Balance Bills'
    },
  ]
  selectedBillType: any = {
    label: 'Balance Bills'
  }
  selectedDates: { startDate: moment.Moment, endDate: moment.Moment };
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'Last 3 Month': [
      moment()
        .subtract(3, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ]
  }
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  totalAmountSum = 0;
  paidAmountSum:number = 0;
  balanceAmountSum:number = 0;
  filteredItems: any = []
  selectedBillDetails: any;
  addNewAmount: any = undefined;
  isInvalidPayAmount = false;
  allBills:any = []
  isInvalidDate = (current: moment.Moment) => {
    const currentDate = moment();
    return current.isAfter(currentDate, 'day'); // Disable future dates
  };
  constructor(
    private authService: AuthGuardService,
    private cryptService: CryptoService,
    private appMetaService: AppMetaCreationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private entityService: EntityService,
    private excelService: ExcelService,
    private navigationService: NavigationService,
  ) {
    this.userDetails = this.authService.getUserDetails();
  }

  onSaveBill() {
    const _id = this.selectedBillDetails._id;
    delete this.selectedBillDetails._id
    this.selectedBillDetails = {
      ...this.selectedBillDetails,
      paidAmount: Number(this.selectedBillDetails.paidAmount) + this.addNewAmount
    }
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "collectionData": this.selectedBillDetails
    }
    this.isLoading = true;
    this.entityService.updateEntityById(_id, formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        Swal.fire('Bill Balance Updated!', '', 'success');
        this.selectedBillDetails = {};
        this.addNewAmount = undefined;
        this.getBills({});
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getBills(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        this.allBills = res.data;
        this.balanceList = this.allBills.filter((data: any) => {
          return data.paymentStatus == 'part' && data.paidAmount != data.finalTotal
        });
        this.filteredItems = [...this.balanceList];
        this.calculateBillAmounts(this.balanceList);
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onBillChange(event: any) {
    if (event.value) {
      if(event.value.label == 'All Invoices'){
        console.log(this.allBills)
        this.balanceList = [...this.allBills]
        this.filteredItems = [...this.balanceList];
        this.calculateBillAmounts(this.balanceList);
      }else{
        this.balanceList = this.allBills.filter((data: any) => {
          return data.paymentStatus == 'part' && data.paidAmount != data.finalTotal
        });
        this.filteredItems = [...this.balanceList];
        this.calculateBillAmounts(this.balanceList);
      }
    } else {
        this.balanceList = [...this.allBills]
        this.filteredItems = [...this.balanceList];
        this.calculateBillAmounts(this.balanceList);
    }
  }

  findTotal(balance: any) {
    return (balance?.finalTotal - balance?.paidAmount).toFixed(2)
  }

  calculateBillAmounts(data: any) {
    this.totalAmountSum = 0;
    this.paidAmountSum = 0;
    this.balanceAmountSum = 0;
    data.forEach((item: any) => {
      this.totalAmountSum += Number(item.finalTotal ? item.finalTotal : 0);
      this.paidAmountSum += Number(item.paidAmount ? item.paidAmount : 0);
      this.balanceAmountSum += (Number(item.finalTotal ? item.finalTotal : 0) - Number(item.paidAmount ? item.paidAmount : 0))
    });
  }

  onDownloadBill(data: any) {
    this.entityService.setinvoiceDetails(data);
    this.navigationService.navigateWithoutLocationChange(['client/bill-download']);
  }

  onEdit(balance: any) {
    balance.isEdit = true
    balance.clone = { ...balance }; // Create a clone of the balance object
  }

  onSave(balance: any) {
    balance.isEdit = false;
    const _id = balance._id;
    delete balance._id
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "collectionData": balance
    }
    this.isLoading = true;

    this.entityService.updateEntityById(_id, formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        Swal.fire('balance Updated!', '', 'success');
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onCancel(balance: any) {
    Object.assign(balance, balance.clone); // Restore the original data
    delete balance.clone; // Remove the clone property
    balance.isEdit = false;
  }

  get pagedServicesList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.balanceList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  ngModelDateChange(event: any) {
    if (this.selectedDates?.startDate && this.selectedDates?.endDate) {
      const startDate = this.selectedDates.startDate.startOf('day');
      const endDate = this.selectedDates.endDate.endOf('day');
      this.Query = {
        bill_balance_date: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate()
        }
      }
      this.getBills(this.Query);
    } else {
      this.getBills();
      this.Query = {}
    }
  }

  updateFilteredItems(event: any): void {
    if (!this.searchText) {
      this.filteredItems = [...this.balanceList];
      this.calculateBillAmounts(this.filteredItems);
    } else {
      this.filteredItems = this.balanceList.filter((item: any) => {
        // Implement your search logic here
        // Return true if the item matches the search criteria
        // Otherwise, return false
        return JSON.stringify(item).toLowerCase().includes(this.searchText);
      });
      this.calculateBillAmounts(this.filteredItems);
    }
  }

  onBillPayment(billDetails: any) {
    this.selectedBillDetails = billDetails;
    this.addNewAmount = undefined;
  }

  chechValidAmount() {
    if (this.addNewAmount > (Number(this.selectedBillDetails.finalTotal) - Number(this.selectedBillDetails.paidAmount))) {
      this.isInvalidPayAmount = true
    } else {
      this.isInvalidPayAmount = false
    }
  }

  exportPdf(){
    let cloneItems = JSON.parse(JSON.stringify(this.filteredItems));
    let exportData = cloneItems.map((data:any)=>{
      let out =  {
        createdAt:this.getDateFormated(new Date(data.createdAt)),
        billNo : data.billNo,
        customerName:data.customerName,
        phone:data.phone,
        address:data.address,
        billedBy:data.billedBy,
        billAmount:data.finalTotal,
        paidAmount:data.paidAmount,
        balanceAmount: data.paymentStatus == 'part' ? (Number(data.finalTotal)-Number(data.paidAmount)).toFixed(2) : 0
      }
      return out;
    })
    this.exportAsXLSX(exportData, 'bills')
  }

  exportAsXLSX(data: any, filename: any): void {
    this.excelService.exportAsExcelFile(data, filename);
  }

  getDateFormated(date: any) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }
}

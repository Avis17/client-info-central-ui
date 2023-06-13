import { Component } from '@angular/core';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { CommonService } from 'src/app/services/common.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { EntityService } from '../../services/entity.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';

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
  newBillBalance: any = {
    name: '',
    phone: '',
    bill_balance_date: new Date()
  };
  expenseCategories = [
    "Electricity",
    "Labour",
    "Travel",
    "Rent",
    "Advance",
    "Others"
  ]
  isLoading: boolean = true;
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
  paidAmountSum = 0;
  balanceAmountSum = 0;
  filteredItems: any = []
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }
  constructor(
    private authService: AuthGuardService,
    private cryptService: CryptoService,
    private appMetaService: AppMetaCreationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private entityService: EntityService
  ) {
    this.userDetails = this.authService.getUserDetails();
  }

  onEdit(expense: any) {
    expense.isEdit = true
  }

  onDelete(expense: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'bill_balance',
      "queryData": {}
    }
    this.isLoading = true;
    this.entityService.deleteEntityById(expense._id, formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        Swal.fire('Balance Bill Paid Successfully!', '', 'success').then(() => {
          this.getBills();
        })
      }
    }, (err: any) => {
      this.isLoading = false;

      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onCancel(expense: any) {
    expense.isEdit = false;
  }

  onSave(balance: any) {
    balance.isEdit = false;
    const _id = balance._id;
    delete balance._id
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'bill_balance',
      "collectionData": balance
    }
    this.isLoading = true;

    this.entityService.updateEntityById(_id, formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        Swal.fire('Bill Balance Updated!', '', 'success');
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onAddService() {

  }

  onAddBill() {
    const clientOffset = new Date().getTimezoneOffset();
    const adjustedDate = new Date(this.newBillBalance.bill_balance_date.getTime() - clientOffset * 60000);
    this.newBillBalance = {
      ...this.newBillBalance,
      bill_balance_date : adjustedDate
    }
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'bill_balance',
      "collectionData": { ...this.newBillBalance, balanceAmount: (this.newBillBalance.totalAmount - this.newBillBalance.paidAmount) }
    }
    this.isLoading = true;
    console.log(formData)
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        this.newBillBalance = {
          bill_balance_date: new Date()
        }
        this.errorHandlingService.errorAlertMsg(res);
        this.getBills();
      }
    }, (err) => {
      this.isLoading = false;

      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getBills(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'bill_balance',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        this.balanceList = res.data;
        this.filteredItems = [...this.balanceList];
        this.calculateBillAmounts(this.balanceList);
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  calculateBillAmounts(data: any) {
    this.totalAmountSum = 0;
    this.paidAmountSum = 0;
    this.balanceAmountSum = 0;
    data.forEach((item: any) => {
      this.totalAmountSum += item.totalAmount;
      this.paidAmountSum += item.paidAmount;
      this.balanceAmountSum += item.balanceAmount;
    });
  }

  onCategoryChange(event: any) {
    if (event.target.value != 'Filter All Category') {
      this.getBills({ selectedCategory: event.target.value });
    } else {
      this.getBills();
    }
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

  checkBillValidation() {
    if (this.newBillBalance.name != '' && this.newBillBalance.phone != '' &&
      this.newBillBalance.totalAmount && this.newBillBalance.paidAmount && this.newBillBalance.bill_balance_date
    ) {
      return false
    }
    return true
  }
}

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
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {

  expensesList:any = []
  searchText:any = '';
  filteredItems:any = []
  currentPage = 1;
  itemsPerPage = 5;
  userDetails:any = {};
  Query:any = {};
  totalExpenseSum : number = 0;
  newexpense:any = {
    selectedCategory: 'Default Category',
    expense_comments: '',
    expense_price: '',
    expense_date : new Date()
  };  
  expenseCategories = [
    "Electricity",
    "Labour",
    "Travel",
    "Rent",
    "Advance",
    "Others"
  ]
  isLoading:boolean  = true;
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

  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }
  constructor(
    private authService: AuthGuardService, 
    private cryptService: CryptoService, 
    private appMetaService: AppMetaCreationService, 
    private errorHandlingService: ErrorHandlingService,
    private commonService:CommonService,
    private entityService:EntityService
  ){
    this.userDetails = this.authService.getUserDetails();
  }

  onEdit(expense: any) {
    expense.isEdit = true
  }

  onDelete(expense: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'expenses',
      "queryData": {}
    }
    this.isLoading = true;
    this.entityService.deleteEntityById(expense._id, formData).subscribe((res:any)=>{
      this.isLoading = false;
      if(res.status == 200){
        Swal.fire('Expense Successfully deleted!', '', 'success').then(()=>{
          this.getExpenses();
        })
      }
    }, (err:any)=>{
      this.isLoading = false;

      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onCancel(expense: any) {
    expense.isEdit = false;
  }

  onSave(expense: any) {
    expense.isEdit = false;
    const _id = expense._id;
    delete expense._id
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'expenses',
      "collectionData" : expense
    }
    this.isLoading = true;

    this.entityService.updateEntityById(_id, formData).subscribe((res:any)=>{
      this.isLoading = false;
      if(res.status == 200){
        Swal.fire('Expense Updated!', '', 'success');
      }
    }, (err:any)=>{
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onAddService() {
    
  }

  onAddexpense(){
    const clientOffset = new Date().getTimezoneOffset();
    const adjustedDate = new Date(this.newexpense.expense_date.getTime() - clientOffset * 60000);
    this.newexpense = {
      ...this.newexpense,
      expense_date : adjustedDate
    }
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'expenses',
      "collectionData": this.newexpense
    }
    this.isLoading = true;
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      this.isLoading = false;

      if (res.status == 200) {
        this.newexpense = {}
        this.errorHandlingService.errorAlertMsg(res);
        this.getExpenses();
      }
    }, (err) => {
      this.isLoading = false;

      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getExpenses(query?:any){
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'expenses',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        this.expensesList = res.data;
        this.filteredItems = [...this.expensesList];
        this.calculateExpenses(this.expensesList)
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  calculateExpenses(data:any){
    this.totalExpenseSum = data.reduce((initialValue:any, data:any)=>{
      return initialValue+data.expense_price
    }, 0)
  }

  updateFilteredItems(event:any): void {
    if (!this.searchText) {
      this.filteredItems = [...this.expensesList];
      this.calculateExpenses(this.filteredItems);
    } else {
      this.filteredItems = this.expensesList.filter((item:any) => {
        // Implement your search logic here
        // Return true if the item matches the search criteria
        // Otherwise, return false
        return JSON.stringify(item).toLowerCase().includes(this.searchText);
      });
      this.calculateExpenses(this.filteredItems);
    }
  }

  onCategoryChange(event:any){
    if(event.target.value != 'Filter All Category'){
      this.getExpenses({selectedCategory : event.target.value});
    }else{
      this.getExpenses();
    }
  }

  get pagedServicesList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.expensesList.slice(startIndex, startIndex + this.itemsPerPage);
  }

  ngModelDateChange(event: any) {
    if (this.selectedDates?.startDate && this.selectedDates?.endDate) {
      const startDate = this.selectedDates.startDate.startOf('day');
      const endDate = this.selectedDates.endDate.endOf('day');
      this.Query = {
        expense_date: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate()
        }
      }
      this.getExpenses(this.Query);
    } else {
      this.getExpenses();
      this.Query = {}
    }
  }

}

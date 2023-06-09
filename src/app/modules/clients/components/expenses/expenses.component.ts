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
  currentPage = 1;
  itemsPerPage = 10;
  userDetails:any = {};
  Query:any = {};
  newexpense:any = {
    selectedCategory: 'Default Category',
    expense_comments: '',
    expense_price: 0
  };  
  expenseCategories = [
    "Electricity",
    "Labour",
    "Travel",
    "Rent",
    "Advance",
    "Others"
  ]
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
    this.entityService.deleteEntityById(expense._id, formData).subscribe((res:any)=>{
      if(res.status == 200){
        Swal.fire('Expense Successfully deleted!', '', 'success').then(()=>{
          this.getExpenses();
        })
      }
    }, (err:any)=>{
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
    this.entityService.updateEntityById(_id, formData).subscribe((res:any)=>{
      if(res.status == 200){
        Swal.fire('Expense Updated!', '', 'success');
      }
    }, (err:any)=>{
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onAddService() {
    
  }

  onAddexpense(){
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'expenses',
      "collectionData": this.newexpense
    }
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      if (res.status == 200) {
        this.newexpense = {}
        this.errorHandlingService.errorAlertMsg(res);
        this.getExpenses();
      }
    }, (err) => {
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
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
        this.expensesList = res.data;
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
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
      this.Query = JSON.stringify({
        createdAt: {
          startDate: this.selectedDates.startDate,
          endDate: this.selectedDates.endDate
        }
      })
      this.getExpenses(JSON.parse(this.Query));
    } else {
      this.Query = JSON.stringify({
        createdAt: {
          startDate: new Date(this.userDetails?.app_meta_details?.createdAt),
          endDate: new Date()
        }
      })
      this.getExpenses();
      this.Query = JSON.stringify({})
    }
  }

}

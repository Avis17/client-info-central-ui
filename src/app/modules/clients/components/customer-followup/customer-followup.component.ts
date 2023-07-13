import { Component, OnDestroy, ViewChild } from '@angular/core';
import { EntityService } from '../../services/entity.service';
import { CommonService } from 'src/app/services/common.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import Swal from 'sweetalert2';
import { Table } from 'primeng/table'
import { ExcelService } from '../../services/excel.service';

@Component({
  selector: 'app-customer-followup',
  templateUrl: './customer-followup.component.html',
  styleUrls: ['./customer-followup.component.scss']
})
export class CustomerFollowupComponent implements OnDestroy{
  customerList: any[] = [];
  selectedCustomers: any[] = [];
  statusOptions: any = [];
  draggedCustomer: any;
  isLoading: boolean = true;
  showUpdate: boolean = true;
  cols: any = [
    {
      header: "Name",
      field: "name"
    },
    {
      header: "Phone",
      field: "phone"
    },
    {
      header: "Status",
      field: "interest"
    },
    {
      header: "Place",
      field: "place"
    },
    {
      header: "Date",
      field: "createdAt"
    },
  ]
  userDetails: any;
  currentPage = 1;
  itemsPerPage = 3;
  newCustomerFollowup: any = {
    interest: 'interested',
    name: '',
    phone: '',
    place: '',
    comments: ''
  };

  @ViewChild('tableref') dt: Table | any;
  searchText: any = '';
  constructor(
    private authService: AuthGuardService,
    private cryptService: CryptoService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private excelService: ExcelService,
    private entityService: EntityService
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.statusOptions = [
      { label: 'Interested', value: 'interested' },
      { label: 'Not Interested', value: 'not-interested' },
      { label: 'May be in Future', value: 'may-be-in-future' },
      { label: 'Done', value: 'Done' }

    ];
    this.isLoading = false
  }

  ngOnInit() {
    this.getAllCustomers({});
    this.selectedCustomers = [];
  }

  getCustomerStatusClass(interestStatus:string) {
    if (interestStatus == 'interested') {
      return "badge bg-success";
    } else if (interestStatus == 'not-interested') {
      return "badge bg-danger";
    } else if (interestStatus == 'may-be-in-future') {
      return "badge bg-warning";
    } else {
      return "badge bg-info";
    }
  }

  filterInterest(event:any){
    if(event.value){
      this.getAllCustomers({interest:event.value})
    }else{
      this.getAllCustomers({})
    }
  }
  

  ngOnDestroy(): void {
    
  }

  onAddNewFollowUp() {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers_followup',
      "collectionData": this.newCustomerFollowup
    }
    this.isLoading = true;
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        this.newCustomerFollowup = {
          interest: 'interested',
          name: '',
          phone: '',
          place: '',
          comments: ''
        };
        this.errorHandlingService.errorAlertMsg(res);
        this.getAllCustomers({});
      }
    }, (err) => {
      this.isLoading = false;

      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getAllCustomers(query: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers_followup',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        this.customerList = res.data;
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getInterestedCount(status:any){
    let count = this.customerList.filter((data:any)=>{
      return data.interest == status;
    })
    return count.length
  }

  dragStart(customer: any) {
    this.draggedCustomer = customer;
  }

  drop() {
    if (this.draggedCustomer) {
      this.draggedCustomer['interest'] = 'Done'
      const draggedCustomerIndex = this.findIndex(this.draggedCustomer);
      this.selectedCustomers = [...this.selectedCustomers, this.draggedCustomer];
      this.customerList = this.customerList.filter((val, i) => i !== draggedCustomerIndex);
      this.onUpdate(this.draggedCustomer)
      this.draggedCustomer = null;
    }
  }

  returnToDraggable(customer: any) {
    customer['interest'] = 'interested';
    this.onUpdate(customer)
    this.selectedCustomers = this.selectedCustomers.filter((selectedCustomer) => selectedCustomer !== customer);
    this.customerList.unshift(customer);
  }

  dragEnd() {
    this.draggedCustomer = null;
  }

  findIndex(customer: any): number {
    return this.customerList.findIndex((c) => c === customer);
  }

  updateInterest(customer: any) {
    // Perform any additional logic or API call to update the interest of the customer
    customer.isEdit = false;
    this.onUpdate(customer)
  }

  applyFilterGlobal($event: any, stringVal: string) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
  
  onUpdate(data: any) {
    const _id = data._id;
    delete data._id;
    console.log("update", data)
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers_followup',
      "collectionData" : data
    }
    this.isLoading = true;

    this.entityService.updateEntityById(_id, formData).subscribe((res:any)=>{
      this.isLoading = false;
      if(res.status == 200){
        Swal.fire('Customer details Updated!', '', 'success');
        this.getAllCustomers({})
      }
      this.errorHandlingService.errorAlertMsg(res);
    }, (err:any)=>{
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  checkValidations(){
    if(this.newCustomerFollowup.name != '' && this.newCustomerFollowup.phone != '' && this.newCustomerFollowup.place != '' && this.newCustomerFollowup.comments){
      return false
    }
    return true;
  }

  exportPdf(){
    this.exportAsXLSX(this.customerList.map((data:any)=> {
      return {
        ...data, 
        createdAt:this.getDateFormated(new Date(data.createdAt))
      }
    }), 'customers-followup-list')
  }

  exportAsXLSX(data: any, filename: any): void {
    this.excelService.exportAsExcelFile(data, filename);
  }

  getDateFormated(date: any) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }
}

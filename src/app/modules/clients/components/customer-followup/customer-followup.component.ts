import { Component, OnDestroy, ViewChild } from '@angular/core';
import { EntityService } from '../../services/entity.service';
import { CommonService } from 'src/app/services/common.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import Swal from 'sweetalert2';
import { Table } from 'primeng/table'

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
    private entityService: EntityService
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.statusOptions = [
      { label: 'Interested', value: 'interested' },
      { label: 'Not Interested', value: 'not-interested' },
      { label: 'May be in Future', value: 'may-be-in-future' }
    ];
    this.isLoading = false
  }

  ngOnInit() {
    this.getAllCustomers({});
    this.selectedCustomers = [];
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
        this.customerList = [];
        this.selectedCustomers = [];
        res.data.forEach((data:any)=>{
          if(data.interest == 'Done'){
            this.selectedCustomers.push(data)
          }else{
            this.customerList.push(data)
          }
        })
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
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
}

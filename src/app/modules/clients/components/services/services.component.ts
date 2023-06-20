import { Component } from '@angular/core';
import { ErrorHandlerInterceptor } from 'src/app/interceptor/error-handler.interceptor';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import Swal from 'sweetalert2'
import { CanComponentDeactivate } from '../../guards/can-component-deactivate.guard';
import { CryptoService } from 'src/app/services/crypto.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements CanComponentDeactivate {

  columns: any = [];
  servicesList: any = [];
  userDetails: any = []
  newService: any = {}
  currentPage = 1;
  itemsPerPage = 10;
  searchText :any = '';
  isLoading:boolean  = false;
  newCategoryName : string = ''
  constructor(private authService: AuthGuardService, private cryptService: CryptoService, private appMetaService: AppMetaCreationService, private errorHandlingService: ErrorHandlingService) {
    this.userDetails = this.authService.getUserDetails();
    this.servicesList = JSON.parse(JSON.stringify(this.userDetails?.app_meta_details?.servicesList.categories || []))
  }

  updateServicesData(resolve: any) {
    let query = {
      _id: this.userDetails.app_meta_details._id,
      data: {
        ...this.userDetails.app_meta_details,
        servicesList: {
          categories : this.servicesList
        }
      }
    }
    delete query.data._id;
    delete query.data.__v;
    this.isLoading = true;
    this.appMetaService.updateAppMetaById(query).subscribe((res: any) => {
      this.isLoading = false;
      console.log("update", res)
      if (res.status == 200) {
        this.authService.setUserDetails(
          {
            ...this.userDetails,
            app_meta_details : res.data
          }
        )
        resolve(true)
      }
      resolve(false)
    }, (err) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
      resolve(true)
    })
  }

  onEdit(service: any) {
    service.isEdit = true
    service.clone = { ...service }; // Create a clone of the expense object
  }

  onDelete(service: any,category:any,index:number) {
 
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert service!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        category.items.splice(index, 1)
        Swal.fire(
          'Deleted!',
          'Service has been deleted.',
          'success'
        )
      }
    })
  }

  onCancel(service: any, category:any,index:number) {
    if(service.itemName != '' && service.itemPrice != ''){
      Object.assign(service, service.clone); // Restore the original data
      delete service.clone; // Remove the clone property
      service.isEdit = false;
    }else{
      category.items.splice(index, 1);
    }
  }

  onSave(service: any,category:any,index:number) {
    if(service.itemName != '' && service.itemPrice != ''){
      service.isEdit = false;
    }
  }

  onAddService() {
    this.servicesList.push(this.newService);
    this.newService = {}
    console.log(this.servicesList)
  }

  onAddServiceOnCategory(category:any){
    category.items.push({
      itemName: '',
      itemPrice : '',
      isEdit : true
    })
  }

  onAddNewCategory(){
    this.servicesList.push({
      categoryName : this.newCategoryName,
      items : [
        {
          itemName: '',
          itemPrice : '',
          isEdit : true
        }
      ]
    })
    this.newCategoryName = ''
  }

  onRemoveCategory(category:any, index:number){
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert category!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.servicesList.splice(index, 1)
        Swal.fire(
          'Deleted!',
          'Category has been deleted.',
          'success'
        )
      }
    })
  }

  canDeactivate(): any {
    console.log(this.userDetails?.app_meta_details?.servicesList.categories)
    console.log(this.servicesList)
    return new Promise<boolean>((resolve) => {
      if(JSON.stringify(this.userDetails?.app_meta_details?.servicesList.categories) == JSON.stringify(this.servicesList)){
        resolve(true); 
      }else{
        Swal.fire({
          title: 'Do you want to save the changes?',
          showCancelButton: true,
          confirmButtonText: 'Save',
        }).then((result) => {
          if (result.isConfirmed) {
            this.updateServicesData(resolve);
          } else {
            Swal.fire('Changes are not modified', '', 'info');
            resolve(true); 
          }
        });
      }
      
    });
  }

  get pagedServicesList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.servicesList.slice(startIndex, startIndex + this.itemsPerPage);
  }
}

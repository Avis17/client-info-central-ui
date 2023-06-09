import { Component } from '@angular/core';
import { ErrorHandlerInterceptor } from 'src/app/interceptor/error-handler.interceptor';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import Swal from 'sweetalert2'
import { CanComponentDeactivate } from '../../guards/can-component-deactivate.guard';
import { CryptoService } from 'src/app/services/crypto.service';

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
  searchText :any = ''
  constructor(private authService: AuthGuardService, private cryptService: CryptoService, private appMetaService: AppMetaCreationService, private errorHandlingService: ErrorHandlingService) {
    this.userDetails = this.authService.getUserDetails();
    this.servicesList = [...this.userDetails.app_meta_details.servicesList];
  }

  updateServicesData(resolve: any) {
    let query = {
      _id: this.userDetails.app_meta_details._id,
      data: {
        ...this.userDetails.app_meta_details,
        servicesList: this.servicesList
      }
    }
    delete query.data._id;
    delete query.data.__v;
    this.appMetaService.updateAppMetaById(query).subscribe((res: any) => {
      if (res.status == 200) {
        this.authService.logoutWithoutNavigate();
        resolve(true);
      }
      resolve(false)
    }, (err) => {
      this.errorHandlingService.errorAlertMsg(err);
      resolve(true);
    })
  }

  onEdit(service: any) {
    service.isEdit = true
  }

  onDelete(service: any) {
    this.servicesList = this.servicesList.filter((data: any) => {
      return data != service
    })
    console.log(this.servicesList)
  }

  onCancel(service: any) {
    this.servicesList = [...this.userDetails.app_meta_details.servicesList];
    service.isEdit = false;
  }

  onSave(service: any) {
    service.isEdit = false
  }

  onAddService() {
    this.servicesList.push(this.newService);
    this.newService = {}
    console.log(this.servicesList)
  }

  canDeactivate(): any {
    return new Promise<boolean>((resolve) => {
      Swal.fire({
        title: 'Do you want to save the changes?',
        showCancelButton: true,
        confirmButtonText: 'Save',
      }).then((result) => {
        if (result.isConfirmed) {
          // Allow navigation
          this.updateServicesData(resolve);
        } else {
          Swal.fire('Changes are not modified', '', 'info');
          resolve(true); // Prevent navigation
        }
      });
    });
  }

  get pagedServicesList(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.servicesList.slice(startIndex, startIndex + this.itemsPerPage);
  }
}

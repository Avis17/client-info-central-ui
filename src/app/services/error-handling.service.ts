import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from './navigation.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(private toastr: ToastrService, private navigationService: NavigationService) { }

  errorAlertMsg(code: number, commands?: any) {
    switch (code) {
      case 200:
        this.toastr.success("New Entity Added Successfully!!", "Notification");
        this.navigationService.navigateWithoutLocationChange(commands);
        break;
      case 400:
        this.toastr.error("Bad Request, try again!", 'Error')
        break;
      case 401:
        this.toastr.info("Dublicate Entity found, try new data!", 'Notification')
        break;
      case 404:
        this.toastr.warning("No data Found !!", "Notification");
        break;
      case 500:
        this.toastr.error("Server error, try creating again!", 'Error')
        break;
      default:
        this.toastr.error("Server error, try creating again!", 'Error')
        break;
    }
  }

}

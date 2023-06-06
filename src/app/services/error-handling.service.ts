import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from './navigation.service';
import { AuthGuardService } from './auth-guard.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(private authenticationService:AuthGuardService,private toastr: ToastrService, private navigationService: NavigationService) { }

  errorAlertMsg(status: any, commands?: any) {
    const login_commands = ['/'];
    switch (status.status) {
      case 200:
        this.toastr.success("Entity Updated Successfully!!", "Notification");
        this.navigationService.navigateWithoutLocationChange(commands);
        break;
      case 400:
        console.log(status.message)
        this.toastr.error("Bad Request, try again!", 'Error')
        break;
      case 401:
        console.log(status.message)
        this.authenticationService.logout()
        break;
      case 403:
        console.log(status.message)
        this.authenticationService.logout()
        break;
      case 404:
        this.toastr.warning("No data Found !!", "Notification");
        break;
      case 409:
        console.log(status.message)
        this.toastr.error("Dublicate Entity found, try new data!", 'Notification')
        break;
      case 500:
        console.log(status.message)
        this.toastr.error("Sorry, the server is busy. Please try again later", 'Error')
        break;
      default:
        this.toastr.error("Sorry, the server is busy. Please try again later", 'Error')
        break;
    }
  }

}

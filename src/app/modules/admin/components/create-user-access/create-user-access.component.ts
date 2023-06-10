import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from 'src/app/services/navigation.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';


export interface user {
  email: string;
  password: string;
  authorizeTo: string;
}


@Component({
  selector: 'app-create-user-access',
  templateUrl: './create-user-access.component.html',
  styleUrls: ['./create-user-access.component.scss']
})
export class CreateUserAccessComponent {

  userDetails : user;
  isConfirmPassword : boolean = true;
  isHidePassword = true;
  isHideConfirmPassword = true;
  isDisableBtn = false;
  isLoading:boolean  = false;

  constructor(
    private navigationService :NavigationService,
    private authGuardService:AuthGuardService, 
    private errorHandlingService:ErrorHandlingService,
    private toastr: ToastrService
    ){
    this.userDetails = {
      email : '',
      password : '',
      authorizeTo : ''
    }
  }

  onChangePassword(event:any){
    this.isConfirmPassword = false
    if(event.target.value == this.userDetails.password){
      this.isConfirmPassword = true
    }else{
      this.isConfirmPassword = false
    }
  }

  onPreviousPage(){
    const commands = ['/admin/tools'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }

  onRegisterBtnClick(){
    this.isLoading = true;

    this.authGuardService.register(this.userDetails).subscribe((res:any)=>{
      this.isLoading = false;

      if(res){
        this.errorHandlingService.errorAlertMsg(res, ['/admin/tools'])
      }
    }, (err)=>{
      this.isLoading = false;

      this.errorHandlingService.errorAlertMsg(err, ['/admin/tools'])
    })
  }

  vaidateUser(){
    if(this.isConfirmPassword && this.userDetails.email != '' && this.userDetails.password != '' && this.userDetails.authorizeTo != ''){
      return false
    }else{
      return true
    }
  }
}

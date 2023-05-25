import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from 'src/app/services/navigation.service';


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

  constructor(private navigationService :NavigationService, private authGuardService:AuthGuardService, private toastr: ToastrService){
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


  onRegisterBtnClick(){
    this.authGuardService.register(this.userDetails).subscribe((res:any)=>{
      if(res){
        if( res.status == 200 ){
          this.toastr.success("User created successfully !!", "Notification");
          const commands = ['/admin/tools'];
          this.navigationService.navigateWithoutLocationChange(commands);
        } else if( res.status == 400 ){
          this.toastr.info("Email already exists, try login!", 'Notification')
        } else if( res.status == 500 ){
          this.toastr.error("Server error, try creating again!", 'Error')
        }
      }else{
        this.toastr.error("Server error, try creating again!", 'Error')
      }
    }, (err)=>{
      this.toastr.error("Server error, try creating again!", 'Error')
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

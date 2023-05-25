import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  email : string = ""
  password : string = ''
  constructor(private toastr: ToastrService, private navigationService: NavigationService, private authService:AuthGuardService){

  }

  onLoginBtnClick(){
    this.authService.login({"email":this.email, "password":this.password}).subscribe((res:any)=>{
      if(res.status == 200){
        sessionStorage.setItem("user", JSON.stringify(res.data));
        if(res.data.authorizeTo == "admin" || res.data.authorizeTo == "developer"){
          const commands = ['/admin/tools'];
          this.navigationService.navigateWithoutLocationChange(commands);        
        }else{
          const commands = ['/clients'];
          this.navigationService.navigateWithoutLocationChange(commands);        }
      }else{
        this.toastr.error("Server error, Try again later please..!", 'Error')
      }
    }, (err)=>{
      if(err.status == 401){
        this.toastr.error("Invalid credentials, try again!", 'Error')
        return
      }
      this.toastr.error("Server error, Try again later please..!", 'Error')
    })
  }
}

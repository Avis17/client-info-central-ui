import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from 'src/app/services/navigation.service';
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  email : string = ""
  password : string = ''
  constructor(private cryptService:CryptoService,private toastr: ToastrService, private navigationService: NavigationService, private authService:AuthGuardService){
    let userDetails:any = authService.getSessionUserDetails()
    if(userDetails){
      userDetails = JSON.parse(cryptService.decrypt(userDetails));
      this.navigateToAuthorizeModule(userDetails.authorizeTo)
    }
  }

  navigateToAuthorizeModule(authorizeTo:string){
    if(authorizeTo == "admin" || authorizeTo == "developer"){
      const commands = ['/admin/tools'];
      this.navigationService.navigateWithoutLocationChange(commands);        
    }else if(authorizeTo == "client"){
      const commands = ['/client'];
      this.navigationService.navigateWithoutLocationChange(commands);        
    }else{
      this.toastr.warning("No Access", 'Warning');
    }
  }

  onLoginBtnClick(){
    this.authService.login({"email":this.email, "password":this.password}).subscribe((res:any)=>{
      if(res.status == 200){
        let decryptedData:any = this.setStorage(res.data);
        this.navigateToAuthorizeModule(decryptedData.authorizeTo);
        this.authService.setUserDetails(decryptedData);
      }else if(res.status == 404){
        this.toastr.error("Invalid credentials, try again!", 'Error')
        return
      }else{
        this.toastr.error("Server error, Try again later please..!", 'Error')
        return;
      }
    }, (err)=>{
      if(err.status == 401){
        this.toastr.error("Invalid credentials, try again!", 'Error')
        return
      }else{
        this.toastr.error("Server error, Try again later please..!", 'Error')
      }
    })
  }

  setStorage(data:any){
        this.authService.setSessionUserDetails(data)
        let decryptedData:any = this.cryptService.decrypt(data);
        decryptedData = JSON.parse(decryptedData);
        this.authService.setToken(decryptedData.token)
        return decryptedData;
  }
}

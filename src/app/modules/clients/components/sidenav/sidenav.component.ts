import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  userDetails : any;
  linkActive : any = {
    "dashboard" : true,
    "billing" : false,
    "clients" : false,
  }
  constructor(private authService:AuthGuardService){
    this.userDetails = this.authService.getUserDetails();
  }

  onClickLink(link:string){
    for(let li in this.linkActive){
      if(li == link){
        this.linkActive[li] = true;
      }else{
        this.linkActive[li] = false;
      }
    }
    console.log(this.linkActive)
  }
}

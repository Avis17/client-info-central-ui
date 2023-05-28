import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(private authGuardService:AuthGuardService){

  }
  logout(){
   this.authGuardService.logout();
  }
}

import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  userDetails : any;
  constructor(private authService:AuthGuardService){
    this.userDetails = this.authService.getUserDetails();
  }
}

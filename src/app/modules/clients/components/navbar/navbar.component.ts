import { Component, EventEmitter, Output } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  @Output()
  toggleStatus = new EventEmitter(false);
  isShow = true;
  userDetails : any;
  constructor(private authService:AuthGuardService){
    this.userDetails = this.authService.getUserDetails();
  }

  onSidebarToggleClick(){
    this.isShow = !this.isShow;
    this.toggleStatus.emit(this.isShow)
  }

  onLogout(){
    this.authService.logout();
  }
}

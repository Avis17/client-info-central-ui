import { Component } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(private authService:AuthGuardService){
    console.log(this.authService.getUserDetails())
  }
}

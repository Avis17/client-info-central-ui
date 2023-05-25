import { Component } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  constructor(private navigationService: NavigationService){

  }

  onRegisterUser(){
    const commands = ['/admin/register-user'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }
}

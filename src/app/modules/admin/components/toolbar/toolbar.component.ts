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

  onClickNavigation(path:string){
    const commands = ['/admin/'+path];
    this.navigationService.navigateWithoutLocationChange(commands);
  }
}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppMetaCreationService } from '../../services/app-meta-creation.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';

@Component({
  selector: 'app-view-detailed-meta',
  templateUrl: './view-detailed-meta.component.html',
  styleUrls: ['./view-detailed-meta.component.scss']
})
export class ViewDetailedMetaComponent {

  appId : string = '';
  appDetails:any;
  isLoading:boolean  = true;

  constructor(
    private activatedRoute:ActivatedRoute,
    private appMetaService:AppMetaCreationService,
    private navigationService:NavigationService,
    private errorHandlingService:ErrorHandlingService,
    ){
    this.appId = this.activatedRoute.snapshot.paramMap.get('id') || '';
    this.getMetaDetailsById()
  }

  getMetaDetailsById(){
    this.isLoading = true;
    this.appMetaService.getAllAppMetas({_id : this.appId}).subscribe((res:any)=>{     
      this.isLoading = false;
      if(res){
        this.appDetails = res.data[0];
        console.log(this.appDetails)
      }else{
        this.appDetails = {};
      }
    }, (err)=>{
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err)
    })
  }

  onPreviousPage(){
    const commands = ['/admin/view-app-metas'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }
}

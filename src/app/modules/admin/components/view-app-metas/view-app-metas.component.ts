import { Component } from '@angular/core';
import { AppMetaCreationService } from '../../services/app-meta-creation.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { MenuItem } from 'primeng/api';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-app-metas',
  templateUrl: './view-app-metas.component.html',
  styleUrls: ['./view-app-metas.component.scss']
})
export class ViewAppMetasComponent {

  constructor(
    private appMetaService:AppMetaCreationService,
    private navigationService:NavigationService,
    private errorHandlingService:ErrorHandlingService,
    private toastr: ToastrService

    ){
      this.getAllAppMetas();
  }

  addItems(){
    this.items = [
      {
          label: 'Delete',
          icon: 'pi pi-times',
          command: () => {
          }
      },
      {
        label: 'Save',
        icon: 'pi pi-check',
        command: () => {
            this.onSave();
        }
    }
  ];

  return this.items;
  }

  allAppMetas :any;
  items: MenuItem[] = [];  
  selectedItem :any;
  getAllAppMetas(){
    this.appMetaService.getAllAppMetas({}).subscribe((res)=>{
      if(res){
        this.allAppMetas = res.data;
        console.log(this.allAppMetas)
      }
    },(err)=>{
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onSave(){
    this.selectedItem.isEdit = false
  }


  onDelete(id:string){
    this.appMetaService.deleteAppMeta(id).subscribe((res:any)=>{
      if(res.status == 200){
        this.toastr.success('Meta Deleted Successfully.', 'Notification');
        this.getAllAppMetas();
      } 
    }, err => this.errorHandlingService.errorAlertMsg(err))
  }

  onEdit(app:any){
    console.log(app)
    app.isEdit = true
  }

  onDropDownClick(item:any){
    this.selectedItem = item;
  }


  onPreviousPage(){
    const commands = ['/admin/tools'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }
}

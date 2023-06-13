import { Component } from '@angular/core';
import { AppMetaCreationService } from '../../services/app-meta-creation.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { MenuItem } from 'primeng/api';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.scss']
})
export class ViewUsersComponent {
  constructor(
    private appMetaService:AppMetaCreationService,
    private navigationService:NavigationService,
    private errorHandlingService:ErrorHandlingService,
    private toastr: ToastrService

    ){
      this.getAllAppUsers();
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

  allAppUsers :any;
  items: MenuItem[] = [];  
  selectedItem :any;
  isLoading:boolean  = true;
  searchText : string = '';
  currentPage = 1;
  itemsPerPage = 5;

  getAllAppUsers(){
    this.isLoading = true;

    this.appMetaService.getAllUsers({}).subscribe((res)=>{
      this.isLoading = false;

      if(res){
        this.allAppUsers = res.data;
        console.log(this.allAppUsers)
      }
    },(err)=>{
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onSave(){
    this.selectedItem.isEdit = false
  }


  onDelete(id:string){
    this.isLoading = true;
    this.appMetaService.deleteUserById(id).subscribe((res:any)=>{
      this.isLoading = false;
      console.log(res)
      if(res.status == 200){
        this.toastr.success('Meta Deleted Successfully.', 'Notification');
        this.getAllAppUsers();
      } 
    }, (err) =>{
      this.errorHandlingService.errorAlertMsg(err)
      this.isLoading = false;
    })
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

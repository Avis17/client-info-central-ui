import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from 'src/app/services/navigation.service';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { AppMetaCreationService } from '../../services/app-meta-creation.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalComponent } from 'src/app/common/components/modal/modal.component';
import { ModalConfig }  from "../../../../utils/modal.config"
@Component({
  selector: 'app-create-application-meta',
  templateUrl: './create-application-meta.component.html',
  styleUrls: ['./create-application-meta.component.scss']
})
export class CreateApplicationMetaComponent implements OnInit {


  dynamicAppMetaForm: any;
  appCategories: any = [];
  stepperOrientation: Observable<StepperOrientation>;
  fieldsType: string[] = [
    "text",
    "number",
    "date",
    "file",
    "checkbox",
    "radio",
    "email",
    "password",
    "submit",
    "button",
    "hidden"
  ]

  fieldsValue: string[] = [
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "object",
    "array",
    "any"
  ]
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup:FormGroup;
  isSecondFormValid = false;
  @ViewChild('modal') private modalComponent: ModalComponent
  modalConfig:ModalConfig = {
    modalTitle: "Add New Form Field",
    closeButtonLabel: 'Add Field',
    hideDismissButton() {
      return true
    },
    disableCloseButton : ()=>{
      return !this.isSecondFormValid;
    },
  }
 
  async openModal() {
    return await this.modalComponent.open();
  }

  constructor(
    private _formBuilder: FormBuilder,
    private navigationService: NavigationService,
    private authGuardService: AuthGuardService,
    private toastr: ToastrService,
    private appMetaService: AppMetaCreationService,
    breakpointObserver: BreakpointObserver
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

      this.formFieldsCreate();
      this.secondFormGroup.statusChanges.subscribe((status)=>{
        this.isSecondFormValid = status === 'VALID';
      })
  }


  onFormDataSaved(formData: any): void {
    // Access the form data here
    console.log(formData);
  }
  

  formFieldsCreate(){
    //first stepper
    this.firstFormGroup = this._formBuilder.group({
      "company_name": ["", Validators.required],
      "company_email": ["", Validators.required],
      "application_name": ["", Validators.required],
      "application_category": ["", Validators.required],
    });

    // second stepper
    this.secondFormGroup = this._formBuilder.group({
      "application_table_required": ["", Validators.required],
      "table_fileds": this._formBuilder.array([])
    });
    // third stepper
    this.thirdFormGroup = this._formBuilder.group({
      "application_charts_required": ["", Validators.required],
    });
  }

  ngOnInit() {
    this.getAppCategories();
  }

  addFieldsObj() {
    const control = this.secondFormGroup.get('table_fileds') as FormArray;
    control.push(this._formBuilder.group(this.getListOfFields()))
  }

  getListOfFields() {
    return {
      "field_name": ["", Validators.required],
      "field_key": ["", Validators.required],
      "field_type": ["", Validators.required],
      "field_value": ["", Validators.required],
      "isField_table_show": ["", Validators.required],
      "isField_detailed_show": ["", Validators.required],
      "isMutable": ["", Validators.required],
      "isUnique": ["", Validators.required],
    }
  }
  onFieldAdd() {
    this.openModal();
    this.addFieldsObj();
  }

  getFormControls(){
    let arr = this.secondFormGroup.get('table_fileds') as FormArray;
    return arr.controls
  }

  onFieldRemove(index: number) {
    const control = this.secondFormGroup.get('table_fileds') as FormArray;
    control.removeAt(index)
  }

  getLengthOfArr(){
    let arr = this.secondFormGroup.get('table_fileds') as FormArray;
    return arr.length;
  }
  onPreviousPage() {
    const commands = ['/admin/tools'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }

  getAppCategories() {
    this.appMetaService.getAppCategories().subscribe((res) => {
      if (res) {
        this.appCategories = res.data;
        console.log(this.appCategories)
        return;
      }
      this.appCategories = []
    }, (err) => {
      this.appCategories = []
      console.log(err)
    })
  }

  onSaveFormDetails(){
    let data = {...this.firstFormGroup.value, ...this.secondFormGroup.value, ...this.thirdFormGroup.value }
    this.appMetaService.createNewAppMeta(data).subscribe((res:any)=>{
      if(res){
        if( res.status == 200 ){
          this.toastr.success("New App Meta Created !!", "Notification");
          const commands = ['/admin/tools'];
          this.navigationService.navigateWithoutLocationChange(commands);
        } else if( res.status == 400 ){
          this.toastr.info("App meta details dublicate found, try new data!", 'Notification')
        } else if( res.status == 500 ){
          this.toastr.error("Server error, try creating again!", 'Error')
        }
      }else{
        this.toastr.error("Server error, try creating again!", 'Error')
      }
    }, (err:any)=>{
      this.toastr.error("Server error, try creating again!", 'Error');
      console.log(err)
    })
  }
}

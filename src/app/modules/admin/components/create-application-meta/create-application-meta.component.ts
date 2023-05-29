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
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
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
    "select",
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
  furthFormGroup:FormGroup;
  isSecondFormValid = false;
  @ViewChild('modal') private modalComponent: ModalComponent
  modalConfig:ModalConfig = {
    modalTitle: "Add New Form Field",
    closeButtonLabel: 'Add',
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

  async closeModal(){
    return await this.modalComponent.close()
  }

  constructor(
    private _formBuilder: FormBuilder,
    private navigationService: NavigationService,
    private authGuardService: AuthGuardService,
    private toastr: ToastrService,
    private errorHandlingService:ErrorHandlingService,
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
      "client_name" : ["", Validators.required],
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
    this.furthFormGroup = this._formBuilder.group({
        "dbName":["", Validators.required],
        "customerCollectionName" : ["", Validators.required]
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
      "isField_table_show": [null, Validators.required],
      "isField_detailed_show": [null, Validators.required],
      "isMutable": [null, Validators.required],
      "isRequired" : [null, Validators.required],
      "isUnique": [null, Validators.required],
      "isField_table_sorting" : [null, Validators.required],
      "field_options" :  new FormControl<string[] | null>(null)
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

  onFieldRemove(index: number, option?:string) {
    const control = this.secondFormGroup.get('table_fileds') as FormArray;
    control.removeAt(index);
    if(option == 'modal-close'){
      this.closeModal()
    }
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
        return;
      }
      this.appCategories = []
    }, (err) => {
      this.appCategories = []
      console.log(err)
    })
  }

  onSaveFormDetails(){
    let data = {...this.firstFormGroup.value, ...this.secondFormGroup.value, ...this.thirdFormGroup.value, db_details:this.furthFormGroup.value }
    this.appMetaService.createNewAppMeta(data).subscribe((res:any)=>{
      if(res){
        this.errorHandlingService.errorAlertMsg(res.status, ['/admin/tools'])
      }
    }, (err:any)=>{
      this.errorHandlingService.errorAlertMsg(err.status)
    })
  }
}

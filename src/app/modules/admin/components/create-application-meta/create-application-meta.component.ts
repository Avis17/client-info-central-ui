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
import { ModalConfig } from "../../../../utils/modal.config"
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

  chartTypes: string[] = [
    "pie",
    "doughnut",
    "bar"
  ]

  fieldsList: any = [];

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  furthFormGroup: FormGroup;
  isSecondFormValid = false;
  isThirdFormValid = false;

  @ViewChild('modal') private fieldModalComponent: ModalComponent
  @ViewChild('modal1') private chartModalComponent: ModalComponent

  modalConfig: ModalConfig = {
    modalTitle: "Add New Form Field",
    closeButtonLabel: 'Add',
    hideDismissButton() {
      return true
    },
    disableCloseButton: () => {
      return !this.isSecondFormValid;
    },
  }

  modalConfigChart: ModalConfig = {
    modalTitle: "Add New Chart Details",
    closeButtonLabel: 'Add',
    hideDismissButton() {
      return true
    },
    disableCloseButton: () => {
      return !this.isThirdFormValid;
    },
  }

  async openModal(modelName: string) {
    if (modelName == 'modal') {
      return await this.fieldModalComponent.open();
    } else if (modelName == 'modal1') {
      return await this.chartModalComponent.open();
    } else {
      return await this.fieldModalComponent.open();
    }
  }

  async closeModal(modelName: string) {
    if (modelName == 'modal') {
      return await this.fieldModalComponent.close();
    } else {
      return await this.chartModalComponent.close();
    }
  }

  constructor(
    private _formBuilder: FormBuilder,
    private navigationService: NavigationService,
    private authGuardService: AuthGuardService,
    private toastr: ToastrService,
    private errorHandlingService: ErrorHandlingService,
    private appMetaService: AppMetaCreationService,
    breakpointObserver: BreakpointObserver
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

    this.formFieldsCreate();
    this.secondFormGroup.statusChanges.subscribe((status) => {
      this.isSecondFormValid = status === 'VALID';
    })
    this.thirdFormGroup.statusChanges.subscribe((status) => {
      this.isThirdFormValid = status === 'VALID';
    })
  }


  onFormDataSaved(formData: any): void {
    // Access the form data here
    // console.log(formData);
  }


  formFieldsCreate() {
    //first stepper
    this.firstFormGroup = this._formBuilder.group({
      "company_name": ["", Validators.required],
      "company_email": ["", Validators.required],
      "application_name": ["", Validators.required],
      "application_category": ["", Validators.required],
      "client_name": ["", Validators.required],
    });

    // second stepper
    this.secondFormGroup = this._formBuilder.group({
      "application_table_required": ["", Validators.required],
      "table_fileds": this._formBuilder.array([])
    });
    // third stepper
    this.thirdFormGroup = this._formBuilder.group({
      "application_charts_required": ["", Validators.required],
      "charts_details": this._formBuilder.array([])
    });
    this.furthFormGroup = this._formBuilder.group({
      "dbName": ["", Validators.required],
      "customerCollectionName": ["", Validators.required]
    });
  }

  ngOnInit() {
    this.getAppCategories();
  }

  addFieldsObj() {
    const control = this.secondFormGroup.get('table_fileds') as FormArray;
    control.push(this._formBuilder.group(this.getListOfFields()))
  }

  addChartobj() {
    const control = this.thirdFormGroup.get('charts_details') as FormArray;
    control.push(this._formBuilder.group(this.getChartsDetailsObj()))
  }

  getListOfFields() {
    return {
      "field_name": ["", Validators.required],
      "field_key": ["", Validators.required],
      "field_type": ["", Validators.required],
      "field_value": ["", Validators.required],
      "isField_table_show": [true, Validators.required],
      "isField_detailed_show": [true, Validators.required],
      "isMutable": [true, Validators.required],
      "isRequired": [true, Validators.required],
      "isUnique": [false, Validators.required],
      "isField_table_sorting": [true, Validators.required],
      "field_options": new FormControl<string[] | null>(null)
    }
  }

  getChartsDetailsObj() {
    return {
      "chart_type": ["", Validators.required],
      "chart_field_name": ["", Validators.required]
    }

  }

  onFieldAdd() {
    this.openModal('modal');
    this.addFieldsObj();
  }

  onChartAdd() {
    this.addChartobj();
    this.fieldsList = []
    this.fieldsList = [{
      field_key : "createdAt"
    }, ...this.secondFormGroup.get('table_fileds')?.value];
    this.openModal("modal1");
  }

  getFormControls(fieldName: string, groupName: string) {
    if (groupName == 'second') {
      let arr = this.secondFormGroup.get(fieldName) as FormArray;
      return arr.controls
    } else if (groupName == 'third') {
      let arr = this.thirdFormGroup.get(fieldName) as FormArray;
      return arr.controls
    } else {
      let arr = this.secondFormGroup.get(fieldName) as FormArray;
      return arr.controls
    }

  }

  onFieldRemove(index: number, fieldName:string, modalName: string, option?: string) {
    // console.log(index, fieldName, modalName)
    if (modalName == 'modal') {
      const control = this.secondFormGroup.get(fieldName) as FormArray;
      control.removeAt(index);
      if (option == 'modal-close') {
        this.closeModal('modal')
      }
    }
    if (modalName == 'modal1') {
      const control = this.thirdFormGroup.get(fieldName) as FormArray;
      control.removeAt(index);
      if (option == 'modal-close') {
        this.closeModal('modal1')
      }
    }
  }

  getLengthOfArr(fieldName: string, groupName: string) {
    if (groupName == 'second') {
      let arr = this.secondFormGroup.get(fieldName) as FormArray;
      return arr.length
    } else if (groupName == 'third') {
      let arr = this.thirdFormGroup.get(fieldName) as FormArray;
      return arr.length
    } else {
      return 0
    }
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
      // console.log(err)
    })
  }

  onSaveFormDetails() {
    let isUniqueThere = this.secondFormGroup.get('table_fileds')?.value.filter((data:any)=>{
      return data.isUnique == true
    })
    console.log(isUniqueThere)
    if(isUniqueThere.length > 1){
      let data = { ...this.firstFormGroup.value, ...this.secondFormGroup.value, ...this.thirdFormGroup.value, db_details: this.furthFormGroup.value }
      this.appMetaService.createNewAppMeta(data).subscribe((res: any) => {
        if (res) {
          this.errorHandlingService.errorAlertMsg(res, ['/admin/tools'])
        }
      }, (err: any) => {
        this.errorHandlingService.errorAlertMsg(err)
      })
    }else{
      this.toastr.warning("Add Atleast one unique field in table..!", "Warning")
    }
   
  }
}

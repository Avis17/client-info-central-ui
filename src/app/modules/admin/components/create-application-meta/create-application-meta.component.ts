import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationService } from 'src/app/services/navigation.service';
import { StepperOrientation, MatStepperModule } from '@angular/material/stepper';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators, AbstractControl } from '@angular/forms';
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
  isLoading:boolean  = false;
  fieldsType: string[] = [
    "text",
    "number",
    "email",
    "checkbox",
    "radio",
    "textarea",
    "multipleValues",
    "date",
    "file",
    "select",
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

  fieldsKeyList = [
    "name",
    "email",
    "phone",
    "alternatePhone",
    "gender",
    "address",
    "profession",
    "isMarried",
    "age",
    "place",
    "address",
    "interestedIn",
    "isFutureUpdateRequired",
    "whatsappNumber",
    "aadharNo",
    "salary",
    "bloodGroup",
    "referals"
  ]

  chartTypes: string[] = [
    "pie",
    "doughnut",
    "bar"
  ]

  fieldsList: any = [];
  termsList: any = [
    { terms: "Order can be return in max 10 days." },
    { terms: "Warrenty of the product will be subject to the manufacturer terms and conditions." },
    { terms: "This is system generated invoice." }
  ]

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  furthFormGroup: FormGroup;
  employeeFormGroup: FormGroup;
  servicesFormGroup : any;
  isSecondFormValid = false;
  isThirdFormValid = false;
  isServiceFormValid = false;
  isEmployeeFormValid = false;

  serviceForm: FormGroup;

  @ViewChild('modal') private fieldModalComponent: ModalComponent
  @ViewChild('modal1') private chartModalComponent: ModalComponent
  @ViewChild('employeeModal') private employeeModalComponent: ModalComponent

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

  modalEmployee: ModalConfig = {
    modalTitle: "Add Employee Form Field",
    closeButtonLabel: 'Add',
    hideDismissButton() {
      return true
    },
    disableCloseButton: () => {
      return !this.isEmployeeFormValid;
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
    } else if (modelName == 'employeeModal') {
      return await this.employeeModalComponent.open();
    }
     else {
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
    private formBuilder: FormBuilder,
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
    this.employeeFormGroup.statusChanges.subscribe((status) => {
      this.isEmployeeFormValid = status === 'VALID';
    })
  }


  onFormDataSaved(formData: any): void {
    // Access the form data here
    // console.log(formData);
  }

  onAddService(){
    this.addServiceListGroup();
  }

  onRemoveService(index:any){
    this.servicesFormGroup.get('servicesList').removeAt(index);
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
    
    this.servicesFormGroup = this._formBuilder.group({
      "servicesList": this._formBuilder.array([])
    });
    this.addServiceListGroup();
    // third stepper
    this.thirdFormGroup = this._formBuilder.group({
      "application_charts_required": ["", Validators.required],
      "charts_details": this._formBuilder.array([])
    });
    this.furthFormGroup = this._formBuilder.group({
      "company_address": ["", Validators.required],
      "city": ["", Validators.required],
      "state": ["", Validators.required],
      "country": ["", Validators.required],
      "gstNo": [""],
      "upiId" : ["", Validators.required],
      "logo": ["", Validators.required],
      "signature": ["", Validators.required],
    });
    this.employeeFormGroup = this._formBuilder.group({
      "employee_management_required": ["", Validators.required],
      "employee_fields": this._formBuilder.array([])
    })
  }

  ngOnInit() {
    this.getAppCategories();
    this.serviceForm = this.formBuilder.group({
      categories: this.formBuilder.array([
        this.createCategory()
      ])
    });
  }

  createCategory(): FormGroup {
    return this.formBuilder.group({
      categoryName: ['', Validators.required],
      items: this.formBuilder.array([
        this.createItem()
      ])
    });
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      itemName: ['', Validators.required],
      itemPrice: ['', Validators.required]
    });
  }

  addServiceListGroup(){
    const control = this.servicesFormGroup.get('servicesList') as FormArray;
    control.push(this._formBuilder.group({
      "service_name": ["", Validators.required],
      "service_price": ["", Validators.required],
    }))
  }

  addFieldsObj() {
    const control = this.secondFormGroup.get('table_fileds') as FormArray;
    control.push(this._formBuilder.group(this.getListOfFields()))
  }

  addEmployeeFieldsObj(){
    const control = this.employeeFormGroup.get('employee_fields') as FormArray;
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
      "isMutable": [true, Validators.required],
      "isUnique": [false, Validators.required],
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

  onFieldEmployeeAdd() {
    this.openModal('employeeModal');
    this.addEmployeeFieldsObj();
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
    } else if (groupName == 'employee') {
      let arr = this.employeeFormGroup.get(fieldName) as FormArray;
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
    if (modalName == 'employeeModal') {
      const control = this.employeeFormGroup.get(fieldName) as FormArray;
      control.removeAt(index);
      if (option == 'modal-close') {
        this.closeModal('employeeModal')
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
    }
    else if (groupName == 'employee') {
      let arr = this.employeeFormGroup.get(fieldName) as FormArray;
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
    this.isLoading = true;
    this.appMetaService.getAppCategories().subscribe((res) => {
      this.isLoading = false;
      if (res) {
        this.appCategories = res.data;
        this.appCategories = this.appCategories.reverse();
        return;
      }
      this.appCategories = []
    }, (err) => {
      this.isLoading = false;
      this.appCategories = []
      // console.log(err)
      this.errorHandlingService.errorAlertMsg(err)
    })
  }

  onSaveFormDetails() {
    let isUniqueThere = this.secondFormGroup.get('table_fileds')?.value.filter((data:any)=>{
      return data.isUnique == true
    })
    console.log(isUniqueThere)
    if(isUniqueThere.length >= 1){
      let data = { ...this.firstFormGroup.value, ...this.secondFormGroup.value, servicesList : {...this.serviceForm.value} , ...this.thirdFormGroup.value, billingdetails: {...this.furthFormGroup.value}, terms : this.termsList, ...this.employeeFormGroup.value }
      this.isLoading = true;
      this.appMetaService.createNewAppMeta(data).subscribe((res: any) => {
        this.isLoading = false;
        if (res) {
          this.errorHandlingService.errorAlertMsg(res, ['/admin/tools'])
        }
      }, (err: any) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err)
      })
    }else{
      this.toastr.warning("Add Atleast one unique field in table..!", "Warning")
    }
   
  }

  // new functionality
  getCategoryControls(): FormGroup[] {
    return (this.serviceForm.get('categories') as FormArray).controls as FormGroup[];
  }

  getCategoryItems(category: FormGroup): FormArray {
    return category.get('items') as FormArray;
  }


  addCategory() {
    const categories = this.serviceForm.get('categories') as FormArray;
    categories.push(this.createCategory());
  }


  addItem(category: FormGroup) {
    const items = category.get('items') as FormArray;
    items.push(this.createItem());
  }

  removeCategory(index: number) {
    const categories = this.serviceForm.get('categories') as FormArray;
    categories.removeAt(index);
  }
  
  removeItem(category: FormGroup, index: number) {
    const items = category.get('items') as FormArray;
    items.removeAt(index);
  }

  }

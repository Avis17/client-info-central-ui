import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CommonService } from 'src/app/services/common.service';
import { NavigationService } from 'src/app/services/navigation.service';


const noSpecialCharactersValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value;
  const regex: RegExp = /^[a-zA-Z0-9 ]+$/; // Regular expression to allow only alphanumeric characters and spaces
  if (!regex.test(value)) {
    return { noSpecialCharacters: true };
  }
  return null;
};
const onlyAlphabetsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value;
  const regex: RegExp = /^[a-zA-Z\s]+$/; // Regular expression to allow alphabetic characters and spaces
  if (!regex.test(value)) {
    return { onlyAlphabets: true };
  }
  return null;
};

const phoneNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value;
  const isValidPhoneNumber: boolean = /^\d{10}$/.test(value); // Regular expression to check for 10 digits
  if (!isValidPhoneNumber) {
    return { phoneNumberInvalid: true };
  }
  return null;
};

const aadharNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value;
  const isValidAadharNumber: boolean = /^\d{12}$/.test(value); // Regular expression to check for 12 digits
  if (!isValidAadharNumber) {
    return { aadharNumberInvalid: true };
  }
  return null;
};


@Component({
  selector: 'app-dynamic-form-creation',
  templateUrl: './dynamic-form-creation.component.html',
  styleUrls: ['./dynamic-form-creation.component.scss']
})
export class DynamicFormCreationComponent {

  formGroup: any;
  userDetails: any;
  entitySchema: any = [];
  isUniqueArr: any = [];
  listOfServices: any = [];
  searchItem: string = ''
  isLoading: boolean = false;
  servicesList:any = [];
  formType:string = "";
  formFields:any;
  currentEmployeeNo: any;
  employeeId :string = '';

  ngOnInit() {
    this.createFormGroup();
  }

  createFormGroup() {
    this.formGroup = this.formBuilder.group({});
    this.formFields = this.formType == 'customers' ? (this.userDetails?.app_meta_details?.table_fileds || null) : (this.userDetails?.app_meta_details?.employee_fields || null)
    console.log(this.formFields)
    if(this.formFields){
      for (const field of this.formFields) {
        const fieldKey = field.field_key;
        const fieldValue = '';
        let formControl;
        switch (field.field_type) {
          case 'checkbox':
            const checkboxOptions = field.field_options.map((option: any) => {
              return this.formBuilder.group({
                fieldName: this.commonService.toMongodbCase(option),
                fieldValue: false
              });
            });
            formControl = this.formBuilder.array(checkboxOptions);
            break;
          case 'text':
            if (field.field_key == 'name') {
              formControl = new FormControl(fieldValue, [Validators.required, noSpecialCharactersValidator, onlyAlphabetsValidator]);
              break;
            } else {
              formControl = new FormControl(fieldValue, [Validators.required, noSpecialCharactersValidator]);
              break;
            }
          case 'email':
            formControl = this.formBuilder.control(fieldValue, [Validators.required, Validators.email]);
            break;
          case 'number':
            if (field.field_key == 'phone') {
              formControl = this.formBuilder.control('', [Validators.required, phoneNumberValidator])
              break;
            } else if (field.field_key == 'alternatePhone') {
              formControl = this.formBuilder.control('', [Validators.required, phoneNumberValidator])
              break;
            }
            else if (field.field_key == 'aadharNo') {
              formControl = this.formBuilder.control('', [Validators.required, aadharNumberValidator])
              break;
            } else {
              formControl = this.formBuilder.control(null, [Validators.required]);
              break;
            }
          case 'radio':
            formControl = this.formBuilder.control(fieldValue, [Validators.required]);
            break;
          case 'date':
            formControl = this.formBuilder.control(new Date(fieldValue), [Validators.required]);
            break;
          case 'multipleValues':
            formControl = this.formBuilder.control('');
            break;
          case 'dropdown':
            formControl = this.formBuilder.control(fieldValue, [Validators.required]);
            break;
          default:
            formControl = this.formBuilder.control(fieldValue, [Validators.required]);
            break;
        }
        this.formGroup.addControl(fieldKey, formControl);
      }
    }
    console.log(this.formGroup.value)
  }

  constructor(
    private entityService: EntityService,
    private toastr: ToastrService,
    private authService: AuthGuardService,
    private router: Router,
    private navigationService: NavigationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private formBuilder: FormBuilder
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.isUniqueArr = this.userDetails.app_meta_details.table_fileds.filter((data: any) => {
      return data.isUnique == true
    })
    this.getEmployeeNo({});
    this.servicesList = this.userDetails.app_meta_details.servicesList.categories;
    console.log(this.servicesList)
    this.formType = entityService.getFormType();
  }

  createEntitySchema(field: any) {
    let schema = {
      [field.field_key]: {
        type: this.commonService.toTitleCase(field.field_value) || 'Mixed',
        required: field.isRequired || true,
        unique: field.isUnique || false,
      }
    }
    this.entitySchema.push(schema);
  }

  onPreviousPage() {
    if(this.formType == 'customers'){
      this.navigationService.navigateWithoutLocationChange(['client/clients']);
    }  else{
      this.navigationService.navigateWithoutLocationChange(['client/employee']);
    }
  }

  onServiceOptionChange(event: any, categoryName: any, selectedObj: any) {
    const serviceName = selectedObj.itemName;
    if (event.target.checked) {
      const existingService = this.listOfServices.find((service: any) => service.itemName === serviceName);
      if (!existingService) {
        this.listOfServices.push({ ...selectedObj, createdAt: new Date(), categoryName: categoryName });
      }
    } else {
      this.listOfServices = this.listOfServices.filter((service: any) => service.itemName !== serviceName);
    }
  }
  
  isServiceSelected(categoryName: string, serviceName: string): boolean {
    return this.listOfServices.some((service: any) => service.categoryName === categoryName && service.itemName === serviceName);
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const formData = {
        "schema": '',
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
        "collectionName": this.formType == 'customers' ? 'customers' : 'employees',
        "collectionData": { ...this.formGroup.value, isUniqueField: this.isUniqueArr[0]?.field_key, }
      }
      if(this.formType == 'employees'){
        formData.collectionData = {
          ...formData.collectionData,
          empId:this.employeeId,
        }
      }
      if (formData.dbName == '' || formData.collectionName == '') {
        this.toastr.error("invalid DB details! contact your application provider immediately.", "Error")
        return;
      }
      this.isLoading = true;
      this.entityService.addNewEntity(formData).subscribe((res: any) => {
        this.isLoading = false;
        if (res.status == 200) {
          if(this.formType == 'customers'){
            this.entityService.setinvoiceDetails({ ...formData.collectionData, services: this.listOfServices })
            this.navigationService.navigateWithoutLocationChange(['client/billing']);
          }  else{
            this.navigationService.navigateWithoutLocationChange(['client/employee']);
            this.addEmployeeNo({ employeeDetails: { no: this.currentEmployeeNo } });
          }
        }
      }, (err) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err);
      })
    } else {
      // Handle form validation errors
    }
  }

  validateFormType(){
    if(this.formType == "customers"){
      return this.listOfServices.length == 0
    }
    return false
  }
  getDynamicFields()
  {
    return this.formType == 'customers' ? (this.userDetails?.app_meta_details?.table_fileds || null) : (this.userDetails?.app_meta_details?.employee_fields || null);
  }

  getEmployeeNo(query: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employeeNo',
      "queryData": {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        if (res.data?.length > 0) {
          this.currentEmployeeNo = Number(res.data[0].employeeDetails.no) + 1
          this.employeeId = new Date().getFullYear()+ "" + this.currentEmployeeNo;
        } else {
          this.currentEmployeeNo = 1;
          this.employeeId = new Date().getFullYear()+ "" + this.currentEmployeeNo;
        }
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getTodaysDate(): string {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month since it is zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
  }

  addEmployeeNo(data: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employeeNo',
      "collectionData": data
    }
    this.isLoading = true;
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        // Swal.fire()
      }
    }, (err) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }
  
}





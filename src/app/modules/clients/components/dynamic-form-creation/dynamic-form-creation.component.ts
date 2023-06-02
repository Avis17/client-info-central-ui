import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CommonService } from 'src/app/services/common.service';
import { NavigationService } from 'src/app/services/navigation.service';

@Component({
  selector: 'app-dynamic-form-creation',
  templateUrl: './dynamic-form-creation.component.html',
  styleUrls: ['./dynamic-form-creation.component.scss']
})
export class DynamicFormCreationComponent {

  formGroup: any;
  userDetails: any;
  entitySchema: any = [];
  isUniqueArr:any = []
  ngOnInit() {
    this.formGroup = this.formBuilder.group({});
    this.createFormGroup();
  }

  createFormGroup() {
    for (const field of this.userDetails?.app_meta_details?.table_fileds) {
      this.createEntitySchema(field);
      const fieldKey = field.field_key;
      const fieldValue = '';
      const validators = [Validators.required];
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
          formControl = this.formBuilder.control(fieldValue, validators);
          break;
        case 'email':
          formControl = this.formBuilder.control(fieldValue, validators);
          break;
        case 'number':
          formControl = this.formBuilder.control(null, validators);
          break;
        case 'radio':
          formControl = this.formBuilder.control(fieldValue, validators);
          break;
        case 'date':
          formControl = this.formBuilder.control(new Date(fieldValue), validators);
          break;
        case 'dropdown':
          formControl = this.formBuilder.control(fieldValue, validators);
          break;
        default:
          formControl = this.formBuilder.control(fieldValue, validators);
          break;
      }
      this.formGroup.addControl(fieldKey, formControl);
    }
  }

  constructor(
    private entityService: EntityService,
    private toastr: ToastrService,
    private authService: AuthGuardService,
    private router: Router,
    private navigationService:NavigationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private formBuilder: FormBuilder
  ) {
    this.userDetails = authService.getUserDetails();
    this.isUniqueArr = this.userDetails.app_meta_details.table_fileds.filter((data:any)=>{
      return data.isUnique == true
    })
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
    const commands = ['/client/home'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }

  onSubmit() {
    if (this.formGroup.valid) {
      const formData = {
        "schema": this.entitySchema,
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.dbName) || '',
        "collectionName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.customerCollectionName) || '',
        "collectionData": {...this.formGroup.value, isUniqueField : this.isUniqueArr[0]?.field_key}
      }
      if (formData.dbName == '' || formData.collectionName == '') {
        this.toastr.error("invalid DB details! contact your application provider immediately.", "Error")
        return;
      }
      this.entityService.addNewEntity(formData).subscribe((res: any) => {
        if (res.status == 200) {
          this.errorHandlingService.errorAlertMsg(res, ['client/home']);
        }
      }, (err) => {
        this.errorHandlingService.errorAlertMsg(err);
      })
    } else {
      // Handle form validation errors
    }
  }
}





import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-dynamic-form-creation',
  templateUrl: './dynamic-form-creation.component.html',
  styleUrls: ['./dynamic-form-creation.component.scss']
})
export class DynamicFormCreationComponent {

  formGroup: FormGroup;
  userDetails: any;
  entitySchema : any = [];
  ngOnInit() {
    this.formGroup = this.formBuilder.group({});
    this.createFormGroup();
  }

  createFormGroup(){
    for (const field of this.userDetails?.app_meta_details?.table_fileds) {
      this.createEntitySchema(field);
      const fieldKey = field.field_key;
      const fieldValue = '';
      const validators = [Validators.required];
      let formControl;
      switch (field.field_type) {
        case 'checkbox':
          const checkboxOptions = field.field_options.map((option: any) => {
            return {
              fieldName: option.toLowerCase(),
              fieldValue: null
            };
          });
          formControl = this.formBuilder.control(checkboxOptions);
          break;
        case 'text':
          formControl = this.formBuilder.control(fieldValue, validators);
          break;
        case 'email':
          formControl = this.formBuilder.control(fieldValue, validators);
          break;
        case 'number':
          formControl = this.formBuilder.control(+fieldValue, validators);
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

  constructor(private entityService:EntityService,
    private toastr: ToastrService,
    private authService: AuthGuardService, 
    private router: Router, 
    private errorHandlingService:ErrorHandlingService,
    private commonService:CommonService,
    private formBuilder: FormBuilder
    ) {
    this.userDetails = authService.getUserDetails();
    console.log(this.userDetails)
  }

  createEntitySchema(field:any){
    let schema = {
      [field.field_key] : {
        type : this.commonService.toTitleCase(field.field_value) || 'String',
        required : field.isRequired || true,
        unique : field.isUnique || false,
      }
    }
    this.entitySchema.push(schema);
  }


  onSubmit() {
    if (this.formGroup.valid) {
      const formData = {
        "schema" : this.entitySchema,
        "dbName" : this.commonService.toMongodbCase(this.userDetails.app_meta_details.db_details.dbName) || 'kuat-technologies',
        "collectionName" : this.commonService.toMongodbCase(this.userDetails.app_meta_details.db_details.customerCollectionName) || 'students',
        "collectionData" : this.formGroup.value
      }
      console.log(formData);
      this.entityService.addNewEntity(formData).subscribe((res:any)=>{
        console.log(res.status)
        if(res.status == 200){
          this.errorHandlingService.errorAlertMsg(res.status, ['client/home']);
        }
      }, (err)=>{
        this.errorHandlingService.errorAlertMsg(err.status);
      })
    } else {
      // Handle form validation errors
      console.log('Form is invalid');
    }
  }
}

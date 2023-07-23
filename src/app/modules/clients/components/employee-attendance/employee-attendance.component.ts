import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntityService } from '../../services/entity.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-attendance',
  templateUrl: './employee-attendance.component.html',
  styleUrls: ['./employee-attendance.component.scss']
})
export class EmployeeAttendanceComponent {
  employeeForm: FormGroup;
  employeeList: any[] = [];
  userDetails: any;
  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  entitySchema: any = [];
  isLoading: boolean = true;
  selectedMonth = this.months[new Date().getMonth()];
  selectedYear = new Date().getFullYear();
  attendenceMarked: boolean = false;
  attendanceDetails:any;
  searchText:string = '';
  filteredEmployees: any;
  selectedDate:any = new Date();

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private entityService: EntityService,
    private authService: AuthGuardService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService,
  ) { }

  ngOnInit() {
    this.userDetails = this.authService.getUserDetails();
    this.isLoading = true;
    this.employeeForm = this.fb.group({
      employees: this.fb.array([])
    });
    const now = new Date();
    const startDate = new Date(now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }));
    startDate.setHours(5, 30, 0, 0);
    const endDate = new Date();
    endDate.setHours(endDate.getHours()+5, endDate.getMinutes()+30, 0, 0);
    this.getAttendenceDetails({ createdAt: { startDate, endDate } });
  }

  onDateSelected() {
    const startDate = new Date(this.selectedDate);
    startDate.setHours(5, 30, 0, 0);
    const endDate = new Date(this.selectedDate);
    endDate.setHours(29, 30, 0, 0);
    console.log(startDate, endDate)
    this.getAttendenceDetails({ createdAt: { startDate, endDate } });
  }
  

  filterEmployees() {
    console.log(this.searchText)
    if (this.searchText) {
      const searchTextLower = this.searchText.toLowerCase();
      this.filteredEmployees = this.getFormArray()?.controls.filter((employee: any) => {
        const name = employee?.get('name')?.value.toLowerCase();
        const empId = employee.get('empId')?.value.toLowerCase();
        return name.includes(searchTextLower) || empId.includes(searchTextLower);
      });
      console.log(this.filteredEmployees)
    } else {
      this.filteredEmployees = this.getFormArray()?.controls;
    }
  }

  createEmployeeFormControls(type: string) {
    const employeesFormArray = this.getFormArray();
    // Loop through the employee list and create form controls
    if (type == 'today' && !this.attendenceMarked) {
      this.employeeList.forEach((employee) => {
        const employeeFormGroup = this.fb.group({
          name: [employee.name, Validators.required],
          empId: [employee.empId, Validators.required],
          attendance: ['Present'],
          comments: ''
        });
        employeesFormArray.push(employeeFormGroup);
      });
    } else if(type == 'today' && this.attendenceMarked){
      this.attendanceDetails?.employees.forEach((employee:any) => {
        const employeeFormGroup = this.fb.group({
          name: [employee.name, Validators.required],
          empId: [employee.empId, Validators.required],
          attendance: [employee.attendance],
          comments: employee.comments
        });
        employeesFormArray.push(employeeFormGroup);
      });
    }
    this.filterEmployees();
  }

  onPreviousPage() {
    this.navigationService.navigateWithoutLocationChange(['client/employee']);
  }

  getAllEmployees(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employees',
      "queryData": query || { status : 'active'}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        this.employeeList = res.data;
        this.createEmployeeFormControls('today');
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }
  getFormArray() {
    return this.employeeForm.get('employees') as FormArray;
  }

  onSubmit() {
    this.selectedDate.setHours(new Date().getHours()+5, new Date().getMinutes()+30, 0, 0)
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employee-attendance',
      "collectionData": {...this.employeeForm.value, createdAt : this.selectedDate}
    }
    if (formData.dbName == '' || formData.collectionName == '') {
      this.toastr.error("invalid DB details! contact your application provider immediately.", "Error")
      return;
    }
    this.isLoading = true;
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        Swal.fire('Attendance Updated!', '', 'success');
        // this.navigationService.navigateWithoutLocationChange(['client/employee']);
      }
    }, (err) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getAttendenceDetails(query?: any) {
    this.employeeList = [];
    this.employeeForm.setControl('employees', this.fb.array([]));
    this.attendanceDetails = []
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employee-attendance',
      "queryData": query || {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        if(res.data?.length > 0){
          this.attendanceDetails = res.data[0];
          this.attendenceMarked = true;
          this.createEmployeeFormControls("today");
        }else{
          this.attendenceMarked = false;
          this.getAllEmployees();
        }
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getDateFormated(date = this.selectedDate) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  onUpdate(){
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employee-attendance',
      "collectionData": this.employeeForm.value
    }
    if (formData.dbName == '' || formData.collectionName == '') {
      this.toastr.error("invalid DB details! contact your application provider immediately.", "Error")
      return;
    }
    this.isLoading = true;
    this.entityService.updateEntityById(this.attendanceDetails._id, formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        Swal.fire('Attendance Updated!', '', 'success');
        // this.navigationService.navigateWithoutLocationChange(['client/employee']);
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

}

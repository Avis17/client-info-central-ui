import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NavigationService } from 'src/app/services/navigation.service';
import { CommonService } from 'src/app/services/common.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CryptoService } from 'src/app/services/crypto.service';
import * as moment from 'moment';
import { ExcelService } from '../../services/excel.service';


@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent {

  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  selectedPeriod: any = 'Overall Datas';
  customDayLabels = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'Last 3 Month': [
      moment()
        .subtract(3, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ]
  }
  weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "ThursDay", "Friday", "Saturday"]
  selectedDates: { startDate: moment.Moment, endDate: moment.Moment };
  alwaysShowCalendars: boolean;
  isLoading:boolean = true;
  tableQuery:any = {};
  userDetails: any;
  attendanceDetails:any;
  todaysPresentCount:any = [];
  todaysPresentPercentage:any;
  todaysAbsentCount:any = [];
  todaysAbsentPercentage:any;
  todaysHalfdayCount:any = [];
  todaysHalfdayPercentage:any;
  aggregateData:any;

  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private excelService: ExcelService,
    private commonService: CommonService,
    private navigationService: NavigationService,
    private errorHandlingService: ErrorHandlingService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.alwaysShowCalendars = true;
  }

  isInvalidDate = (current: moment.Moment) => {
    const currentDate = moment();
    return current.isAfter(currentDate, 'day'); // Disable future dates
  };


  ngOnInit(){
    this.isLoading = false;
    this.getTodaysAttendance()
  }

  getTodaysAttendance(){
    const startDate = new Date();
    startDate.setHours(5, 30, 0, 0);
    const endDate = new Date();
    endDate.setHours(endDate.getHours() + 5, endDate.getMinutes() + 30, 0, 0);
    this.getAttendenceDetails({ createdAt: { startDate, endDate } });
  }

  async ngModelDateChange(event: any) {
    if (this.selectedDates?.startDate && this.selectedDates?.endDate) {
      this.selectedPeriod = ''
      this.selectedPeriod = this.getMomentDateFormated(this.selectedDates.startDate, this.selectedDates.endDate);
      this.tableQuery = JSON.stringify({
        createdAt: {
          startDate: this.selectedDates.startDate,
          endDate: this.selectedDates.endDate
        }
      })
      this.getAllEmployeeAggregateDatas(JSON.parse(this.tableQuery));
      this.getAttendenceDetails(JSON.parse(this.tableQuery));
    } else {
      let endDate = new Date();
      endDate.setHours(endDate.getHours()+5, endDate.getMinutes()+30, 0, 0)
      this.tableQuery = JSON.stringify({
        createdAt: {
          startDate: new Date(this.userDetails?.app_meta_details?.createdAt),
          endDate: endDate
        }
      })
      this.getAllEmployeeAggregateDatas(JSON.parse(this.tableQuery));
      this.getTodaysAttendance();
      this.tableQuery = JSON.stringify({})
    }
  }


  getAllEmployeeAggregateDatas(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employees',
      "queryData": queryData || {}
    }
    this.isLoading = true;
    this.entityService.getAllAggregateEmployeeEntities(formData).subscribe((res: any) => {
      if (res?.data) {
       console.log(res)
       this.isLoading = false;
       this.aggregateData = res.data;
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getAttendenceDetails(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employee-attendance',
      "queryData": query || {}
    }
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
        if (res.data?.length > 0) {
          console.log(res.data)
          this.attendanceDetails = res.data[0];
          this.todaysPresentCount = this.attendanceDetails.employees.filter((data:any)=>{
            return data.attendance == 'Present'
          })
          this.todaysAbsentCount = this.attendanceDetails.employees.filter((data:any)=>{
            return data.attendance == 'Absent'
          })
          this.todaysHalfdayCount = this.attendanceDetails.employees.filter((data:any)=>{
            return data.attendance == 'Half-day'
          })
          this.todaysPresentPercentage = (this.todaysPresentCount.length/this.attendanceDetails.employees.length)*100;
          this.todaysAbsentPercentage = (this.todaysAbsentCount.length/this.attendanceDetails.employees.length)*100;
          this.todaysHalfdayPercentage = (this.todaysHalfdayCount.length/this.attendanceDetails.employees.length)*100;
        }else{
          this.attendanceDetails = null
        }
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getMomentDateFormated(startDate: any, endDate: any) {
    const formattedStartDate = new Date(startDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const formattedEndDate = new Date(new Date(endDate).getTime() - 86400000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return formattedStartDate + " - " + formattedEndDate;
  }
}

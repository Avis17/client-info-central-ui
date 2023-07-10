import { Component, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CryptoService } from 'src/app/services/crypto.service';
import { EntityService } from '../../services/entity.service';
import { CommonService } from 'src/app/services/common.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { ExcelService } from '../../services/excel.service';
import Swal from 'sweetalert2';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { FullCalendarComponent } from '@fullcalendar/angular'; // Import FullCalendarComponent
import { Calendar } from '@fullcalendar/core';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {

  @ViewChildren(FullCalendarComponent) fullCalendars: QueryList<FullCalendarComponent>;
  userId = "";
  userDetails: any = {}
  clientInfo: any;
  clientInfoKeys: any = []
  inVoicesList: any = []
  listOfServices: any = []
  newInvoice = false;
  searchItem: string = ''
  servicesList: any = []
  totalRevenue: number = 0;
  isLoading: boolean = true;
  totalServicesList: any[];
  formType: string = "";
  allowance: number = 0;
  monthlySalary: number;
  daysPresent: number=0;
  calculationDays: number;
  tax: number = 0;
  insurance: number = 0;
  pf: number = 0;
  totalSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  setDefaultCalculationDays: boolean = false;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    // Other configuration options
    events: []
  };
  attendanceDetails: any;
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
  calendar: Calendar;


  calculateSalary() {
    const oneDaySalary = this.monthlySalary / this.calculationDays;
    this.totalSalary = oneDaySalary * this.daysPresent;
    this.totalEarnings = this.totalSalary + this.allowance;
    this.totalDeductions = this.tax + this.insurance + this.pf;
    this.netSalary = this.totalEarnings - this.totalDeductions;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private cryptoService: CryptoService,
    private entityService: EntityService,
    private commonService: CommonService,
    private excelService: ExcelService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService,
    private authService: AuthGuardService,
    private appMetaService: AppMetaCreationService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.userId = this.activatedRoute.snapshot.paramMap.get('id') || '';
    this.userId = decodeURIComponent(this.userId);
    this.totalServicesList = this.userDetails.app_meta_details.servicesList.categories;
    this.setDefaultCalculationDays = this.userDetails?.app_meta_details?.payslip?.default_calculation_days ? true : false;
    this.calculationDays = this.userDetails?.app_meta_details?.payslip?.default_calculation_days || undefined;
    this.formType = entityService.getFormType();
    if (this.userId) {
      this.userId = this.cryptoService.decrypt(this.userId);
      this.userId = JSON.parse(this.userId)
    }
    console.log(this.formType)
    if (this.formType == "customers") {
      this.getAllAggregateDatas();
    } else {
      this.getAllAggregateEmployeeDatas();
    }
  }

  updateDefaultCalculationDays() {
    if (this.setDefaultCalculationDays) {
      let query = {
        _id: this.userDetails.app_meta_details._id,
        data: {
          ...this.userDetails.app_meta_details,
          payslip: {
            default_calculation_days: this.calculationDays
          }
        }
      }
      delete query.data._id;
      delete query.data.__v;
      this.isLoading = true;
      this.appMetaService.updateAppMetaById(query).subscribe((res: any) => {
        this.isLoading = false;
        if (res.status == 200) {
          this.authService.setUserDetails(
            {
              ...this.userDetails,
              app_meta_details: res.data
            }
          )
        }
      }, (err: any) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err);
      })
    } else {
      let query = {
        _id: this.userDetails.app_meta_details._id,
        data: {
          ...this.userDetails.app_meta_details,
          payslip: {
            default_calculation_days: null
          }
        }
      }
      delete query.data._id;
      delete query.data.__v;
      this.isLoading = true;
      this.appMetaService.updateAppMetaById(query).subscribe((res: any) => {
        this.isLoading = false;
        if (res.status == 200) {
          this.authService.setUserDetails(
            {
              ...this.userDetails,
              app_meta_details: res.data
            }
          )
        }
      }, (err: any) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err);
      })
    }
  }

  flattenArray(arr: any) {
    return arr.flat(Infinity);
  }

  getAllAggregateDatas(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": this.userId
    }
    this.isLoading = true;
    this.entityService.getAllAggregateDatas(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.data) {
        console.log(res)
        this.clientInfo = res.data.customersList[0];
        this.clientInfoKeys = this.userDetails?.app_meta_details?.table_fileds?.map((data: any) => {
          return { field_name: data.field_name, field_key: data.field_key }
        })
        if (res.data.invoicesList[0]) {
          this.servicesList = this.flattenArray(res.data.products[0]);
          this.totalRevenue = res.data.totalRevenue;
          this.inVoicesList = res.data.invoicesList[0].reverse();
          this.inVoicesList = this.inVoicesList.map((data: any) => {
            return {
              ...data,
              createdAt: this.formatDate(data.createdAt)
            }
          })
        } else {
          this.inVoicesList = []
          this.servicesList = []
          this.totalRevenue = 0;
        }
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  ngAfterViewInit(): void {
    // Access the FullCalendarComponent when it becomes available
    this.fullCalendars.changes.subscribe((components: QueryList<FullCalendarComponent>) => {
      console.log(components.first); // Access the first FullCalendarComponent
      const fullCalendar = components.first;

      if (fullCalendar) {
        // Get the FullCalendar API instance
        this.calendar = fullCalendar.getApi();

        // Re-render the events
        setTimeout(() => {
          this.calendar.render();
        }, 1000);
      }
    });
  }

  getAllAggregateEmployeeDatas(query?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'employees',
      "queryData": this.userId,
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.data) {
        console.log(res)
        this.clientInfo = res.data[0];
        this.monthlySalary = this.clientInfo.salary;
        this.clientInfoKeys = this.userDetails?.app_meta_details?.employee_fields?.map((data: any) => {
          return { field_name: data.field_name, field_key: data.field_key }
        })
        this.clientInfoKeys.unshift({
          field_name: "Employee ID",
          field_key: 'empId'
        })
        const currentDate = new Date();
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        startDate.setHours(5, 30, 0, 0);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setHours(endDate.getHours() + 5, endDate.getMinutes() + 30, 0, 0);
        this.getAttendenceDetails({ createdAt: { startDate, endDate } });
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onPreviousPage() {
    if (this.formType == "customers") {
      const commands = ['/client/clients'];
      this.navigationService.navigateWithoutLocationChange(commands);
    } else {
      const commands = ['/client/employee'];
      this.navigationService.navigateWithoutLocationChange(commands);
    }
  }

  isArrayCheck(fieldValue: any) {
    if (Array.isArray(fieldValue)) {
      return true;
    }
    return false;
  }

  onAddNewInvoice() {
    if (this.listOfServices.length > 0) {
      this.entityService.setinvoiceDetails({ ...this.clientInfo, services: this.listOfServices })
      this.navigationService.navigateWithoutLocationChange(['client/billing']);
    }
  }

  onDownloadBill(data: any) {
    this.entityService.setinvoiceDetails(data);
    this.navigationService.navigateWithoutLocationChange(['client/bill-download']);
  }

  getDate(now: any) {
    if (now) {
      now = new Date(now);
      return now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();
    }
    return ''
  }

  onServiceOptionChange(event: any, categoryName: any, selectedObj: any) {
    if (event.target.checked) {
      this.listOfServices.push({ ...selectedObj, createdAt: new Date(), categoryName: categoryName })
    } else {
      this.listOfServices = this.listOfServices.filter((data: any) => {
        return data.itemName != selectedObj.itemName
      })
    }
  }


  formatDate(dateString: any) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  onClickCardBox(cardName: any) {
    console.log(cardName)
    switch (cardName) {
      case 'products':
        this.exportAsXLSX(this.servicesList, cardName);
        break;
      case 'invoices':
        this.exportAsXLSX(this.inVoicesList, cardName);
        break;
      default:
        Swal.fire("Invalid Card Item Clicked!");
    }
  }

  exportAsXLSX(data: any, filename: any): void {
    this.excelService.exportAsExcelFile(data, filename);
  }

  calculateNoOfDaysPresent(){
    this.attendanceDetails.forEach((data:any)=>{
       if(data.title == 'Present'){
          this.daysPresent = this.daysPresent+1
       }else if(data.title == 'Half-day'){
          this.daysPresent = this.daysPresent+0.5;
       }
    })
  }

  onEdit() {
    this.clientInfo.isEdit = true;
  }

  onSave() {
    this.clientInfo.isEdit = false;
  }

  onDelete() {
    this.clientInfo.isEdit = false;
  }

  generatePayslip() {
    const logo = this.userDetails?.app_meta_details?.billingdetails?.logo;
    const logoStack = [];
    if (logo && logo != 'undefined') {
      logoStack.push({
        image: logo,
        width: 100,
        height: 100
      });
    }

    return {
      content: [
        {
          columns: [
            {
              width: '*',
              alignment: 'left',
              margin: [0, 0, 0, 10], // Add margin-bottom here
              stack: [
                {
                  width: 'auto',
                  stack: logoStack,
                  alignment: 'left',
                  margin: [0, 0, 20, 0]
                },
                {
                  columns: [
                    { width: 120, text: 'Employee Name:', style: 'employeeLabel' },
                    { width: '*', text: this.clientInfo.name, style: 'employeeValue' }
                  ]
                },
                {
                  columns: [
                    { width: 120, text: 'Employee ID:', style: 'employeeLabel' },
                    { width: '*', text: this.clientInfo.empId || '', style: 'employeeValue' }
                  ]
                },
                {
                  columns: [
                    { width: 120, text: 'Pay Date:', style: 'employeeLabel' },
                    { width: '*', text: this.getDateFormated(new Date()), style: 'employeeValue' }
                  ]
                },
                {
                  columns: [
                    { width: 120, text: 'Pay Period:', style: 'employeeLabel' },
                    { width: '*', text: this.months[new Date().getMonth()], style: 'employeeValue' }
                  ]
                },
                {
                  columns: [
                    { width: 120, text: 'Paid Days:', style: 'employeeLabel' },
                    { width: '*', text: this.daysPresent, style: 'employeeValue' }
                  ]
                }
              ]
            },
            {
              width: 'auto',
              margin: [0, 0, 0, 10],
              stack: [
                { text: this.userDetails?.app_meta_details?.company_name, style: 'companyName' },
                { text: this.userDetails?.app_meta_details?.billingdetails?.company_address, style: 'address' },
                { text: this.userDetails?.app_meta_details?.billingdetails?.city + ', ' + this.userDetails?.app_meta_details?.billingdetails?.state + ', ' + this.userDetails?.app_meta_details?.billingdetails?.country, style: 'address' },
                { text: 'GST No: ' + this.userDetails?.app_meta_details?.billingdetails?.gstNo, style: 'address' }
              ]
            }

          ]
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                {
                  text: 'Earnings',
                  style: 'sectionHeader',
                  colSpan: 2,
                  fillColor: '#1C4E80',
                  color: '#FFFFFF'
                },
                {}
              ],
              [
                {
                  text: 'Basic Salary',
                  style: 'tableCell'
                },
                {
                  text: 'Rs.' + this.totalSalary.toFixed(2),
                  style: 'tableCell'
                }
              ],
              [
                {
                  text: 'Allowance',
                  style: 'tableCell'
                },
                {
                  text: 'Rs.' + this.allowance.toFixed(2),
                  style: 'tableCell'
                }
              ],
              [
                {
                  text: 'Total Earnings',
                  style: 'tableCellBold'
                },
                {
                  text: 'Rs.' + this.totalEarnings.toFixed(2),
                  style: 'tableCellBold'
                }
              ],
              [
                {
                  text: 'Deductions',
                  style: 'sectionHeader',
                  colSpan: 2,
                  fillColor: '#1C4E80',
                  color: '#FFFFFF'
                },
                {}
              ],
              [
                {
                  text: 'Tax',
                  style: 'tableCell'
                },
                {
                  text: 'Rs.' + this.tax.toFixed(2),
                  style: 'tableCell'
                }
              ],
              [
                {
                  text: 'Insurance',
                  style: 'tableCell'
                },
                {
                  text: 'Rs.' + this.insurance.toFixed(2),
                  style: 'tableCell'
                }
              ],
              [
                {
                  text: 'Provident Fund (PF)',
                  style: 'tableCell'
                },
                {
                  text: 'Rs.' + this.pf.toFixed(2),
                  style: 'tableCell'
                }
              ],
              [
                {
                  text: 'Total Deductions',
                  style: 'tableCellBold'
                },
                {
                  text: 'Rs.' + this.totalDeductions.toFixed(2),
                  style: 'tableCellBold'
                }
              ],
              [
                {
                  text: 'Net Salary',
                  style: 'tableCellBold',
                  alignment: 'right'
                },
                {
                  text: 'Rs.' + this.netSalary.toFixed(2),
                  style: 'tableCellBold'
                }
              ]
            ]
          }
        },
        {
          columns: [
            {
              width: '*',
              margin: [0, 10, 0, 0],
              stack: [
                { text: 'Thank you for your hard work!', style: 'thankYou', alignment: 'left' }
              ]
            },
            {
              width: 'auto',
              margin: [0, 10, 0, 0],
              stack: [
                { text: 'Authorized Signature', style: 'signature' }
              ]
            },
          ]
        }
      ],
      styles: {
        companyName: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        employeeLabel: {
          fontSize: 12,
          bold: true,
          margin: [0, 2, 0, 0]
        },
        employeeValue: {
          fontSize: 12,
          margin: [0, 2, 0, 0]
        },
        address: {
          fontSize: 10,
          margin: [0, 2, 0, 0]
        },
        payslipTitle: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        employeeDetails: {
          fontSize: 12,
          margin: [0, 2, 0, 0]
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 5, 0, 5],
          fillColor: '#1C4E80',
          color: '#FFFFFF',
          alignment: 'center'
        },
        tableCell: {
          fontSize: 10,
          margin: [0, 2, 0, 2]
        },
        tableCellBold: {
          fontSize: 10,
          bold: true,
          margin: [0, 2, 0, 2]
        },
        signature: {
          fontSize: 12,
          bold: true,
          margin: [0, 30, 0, 0]
        },
        thankYou: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 0],
          alignment: 'center'
        }
      }
    };

  }

  savePayslip() {
    this.calculateSalary();
    const docDefinition: any = this.generatePayslip();
    pdfMake.createPdf(docDefinition).open();
  }

  getDateFormated(date: any) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  getAttendenceDetails(query?: any) {
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
        if (res.data?.length > 0) {
          this.attendanceDetails = res.data.map((data: any) => {
            let eachEmp = {
              ...data.employees.find((emp: any) => {
                return emp.empId == this.clientInfo.empId
              }),
              start: data.createdAt,
              end: data.createdAt
            }
            return {
              title: eachEmp.attendance,
              start: eachEmp.start,
              end: eachEmp.end,
            };
          })
          this.calendarOptions.events = this.attendanceDetails;
          console.log(this.attendanceDetails)
          this.calculateNoOfDaysPresent();
          // this.fullCalendar.getApi().render(); // Render the calendar
        }
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

}

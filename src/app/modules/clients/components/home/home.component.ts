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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],

})
export class HomeComponent implements OnInit {

  entities: any = [];
  ref: DynamicDialogRef;
  userDetails: any;
  entitySchema: any = [];
  dynamicChartDetails: any = [];
  serviceChartDetails: any;
  pieChartData: any;
  pieChartOptions: any;
  tableQuery: string = ''
  chartBackgroundColors = ['#4BCBEB', '#1BCFB4', '#fa9f1b', '#cc2b5e', '#EA6A47', '#1C4E80', "#0091D5", "#A5D8DD", '#7E909A', '#202020'];
  chartHoverBackgroundColors = ['#ffdde1', '#A7BFE8', '#BBD2C5', '#acb6e5', "#EF886C", "#256687", "#0AB1FF", "#C4E6E9", "#8D9DA5", "#3D3D3D"]

  // chartBackgroundColors = ['#ee9ca7', '#6190E8', '#536976', '#86fde8', '#EA6A47', '#1C4E80', "#0091D5", "#A5D8DD", '#7E909A', '#202020'];
  // chartHoverBackgroundColors = ['#ffdde1', '#A7BFE8', '#BBD2C5', '#acb6e5', "#EF886C", "#256687", "#0AB1FF", "#C4E6E9", "#8D9DA5", "#3D3D3D"]
  inVoicesList: any;
  totalRevenue = 0;
  weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "ThursDay", "Friday", "Saturday"]
  selectedDates: { startDate: moment.Moment, endDate: moment.Moment };
  alwaysShowCalendars: boolean;
  listOfServices: any = []
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
  aggregatedDats: any;
  serviceChartDays: any;
  netProfitAndExpenses:any;
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }

  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private excelService:ExcelService,
    private commonService: CommonService,
    private errorHandlingService: ErrorHandlingService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.alwaysShowCalendars = true;
  }

  ngOnInit() {
  }

  loadServicesChart(invoices: any) {
    let response = invoices.map((data: any) => {
      return data.products
    })
    this.listOfServices = this.flattenArray(response);
    let barDetails: any = this.getDestructuredBarChart(this.listOfServices, 'name');
    let serviceChartData = {
      labels: barDetails.labels,
      datasets: [
        {
          label: "Services",
          data: barDetails.data,
          backgroundColor: this.chartBackgroundColors,
          hoverBackgroundColor: this.chartHoverBackgroundColors
        }
      ]
    };
    let serviceChartOptions = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      // plugins: {
      //     legend: {
      //         labels: {
      //             color: textColor
      //         }
      //     }
      // },
      scales: {
        x: {
          ticks: {
            // color: textColorSecondary,
            font: {
              weight: 500
            }
          },
          grid: {
            // color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            // color: textColorSecondary
          },
          grid: {
            // color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
    this.serviceChartDetails = {
      chartType: 'bar',
      chartFieldName: 'services',
      chartName: "Services",
      chartData: serviceChartData,
      chartOptions: serviceChartOptions
    }
  }

  flattenArray(arr: any) {
    return arr.flat(Infinity);
  }

  getCustomersInvoicesEntity(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": queryData || {}
    }
    this.entityService.getCustomersInvoicesEntity(formData).subscribe((res: any) => {
      if (res?.data) {
        // console.log(res)
        this.aggregatedDats = res.data;
        this.dynamicChartDetails = []
        this.entities = []
        this.inVoicesList = []
        this.entities = res.data.customers;
        this.inVoicesList = res.data.invoicesList;
        this.createDynamicChartArr();
        this.loadServicesChart(res.data.invoicesList);
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getAllAggregateDatas(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": queryData || {}
    }
    this.entityService.getAllAggregateDatas(formData).subscribe((res: any) => {
      if (res?.data) {
        // console.log(res)
        this.aggregatedDats = res.data;
        this.dynamicChartDetails = []
        this.entities = []
        this.inVoicesList = []
        this.entities = res.data.customersList;
        this.inVoicesList = res.data.invoicesList;
        this.createDynamicChartArr();
        this.loadServicesChart(res.data.products);
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getStringfiyData(data: any) {
    return JSON.stringify(data);
  }

  ngModelDateChange(event: any) {
    if (this.selectedDates?.startDate && this.selectedDates?.endDate) {
      this.tableQuery = JSON.stringify({
        createdAt: {
          startDate: this.selectedDates.startDate,
          endDate: this.selectedDates.endDate
        }
      })
      // this.getAllAggregateDatas(JSON.parse(this.tableQuery));
      this.getAllServiceChartDatas(JSON.parse(this.tableQuery));
      this.getCustomersInvoicesEntity(JSON.parse(this.tableQuery))
      this.getNetProfitAndExpense(JSON.parse(this.tableQuery))
    } else {
      // this.getAllAggregateDatas();
      this.tableQuery = JSON.stringify({
        createdAt: {
          startDate: new Date(this.userDetails?.app_meta_details?.createdAt),
          endDate: new Date()
        }
      })
      this.getAllServiceChartDatas(JSON.parse(this.tableQuery));
      this.getCustomersInvoicesEntity({})
      this.getNetProfitAndExpense()
      this.tableQuery = JSON.stringify({})
    }
  }

  getAllServiceChartDatas(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "queryData": queryData
    }
    this.entityService.getAllServiceChartDatas(formData).subscribe((res: any) => {
      if (res) {
        this.serviceChartDays = res.data;
        console.log(this.serviceChartDays)
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getNetProfitAndExpense(queryData?: any){
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "queryData": queryData
    }
    this.entityService.getNetProfitAndExpense(formData).subscribe((res: any) => {
      if (res) {
        this.netProfitAndExpenses = res.data
        console.log(this.netProfitAndExpenses)
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  createDynamicChartArr(type: any = 'services') {
    // Iterate over the charts_details array in the configuration object
    this.userDetails?.app_meta_details?.charts_details.forEach((chart: any) => {
      // Create chart detail object
      const chartDetail = {
        chartType: chart.chart_type,
        chartFieldName: chart.chart_field_name,
        chartName: this.userDetails?.app_meta_details?.table_fileds.find((data: any) => {
          return data.field_key == chart.chart_field_name
        })?.field_name || 'Customer',
        chartData: {},
        chartOptions: {
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
                color: '#000'
              }
            }
          }
        }
      }
      let details = this.getDestructuredChartOutput(this.entities, chart.chart_field_name);
      // Process chart data based on the chart type
      switch (chart.chart_type) {
        case 'pie':
          chartDetail.chartData = {
            labels: details.labels,
            datasets: [
              {
                data: details.data,
                backgroundColor: this.chartBackgroundColors,
                hoverBackgroundColor: this.chartHoverBackgroundColors
              }
            ]
          };
          break;
        case 'doughnut':
          chartDetail.chartData = {
            labels: details.labels,
            datasets: [
              {
                data: details.data,
                backgroundColor: this.chartBackgroundColors,
                hoverBackgroundColor: this.chartHoverBackgroundColors
              }
            ]
          };
          break;
        case 'bar':
          let barDetails: any = this.getDestructuredBarChart(this.entities, chart.chart_field_name)
          chartDetail.chartData = {
            labels: barDetails.labels,
            datasets: [
              {
                label: chart.chart_field_name == 'createdAt' ? "Users" : chart.chart_field_name.toUpperCase(),
                data: barDetails.data,
                backgroundColor: this.chartBackgroundColors,
                hoverBackgroundColor: this.chartHoverBackgroundColors
              }
            ]
          };
          break;
        // Add cases for other chart types if needed
        default:
          // console.error('Unsupported chart type:', chart.chart_type);
          break;
      }

      // Add the chart detail object to the chart details array
      this.dynamicChartDetails.push(chartDetail);
      // console.log(this.dynamicChartDetails)
    })
  }


  getDestructuredBarChart(dataArr: any, fieldName: string) {
    const labels = dataArr.map((item: any) => item[fieldName]);
    // Counting the occurrences of each createdAt value
    const counts: any = {};
    labels.forEach((label: any) => {
      // console.log(label)
      if (!Array.isArray(label)) {
        if (fieldName == 'createdAt') {
          label = new Date(label);
          label = label.getDate() + '/' + (label.getMonth() + 1) + '/' + label.getFullYear();
          counts[label] = (counts[label] || 0) + 1;
        } else {
          counts[label] = (counts[label] || 0) + 1;
        }
      } else {
        label = this.destructureArray(label, 'array');
        label.forEach((child: any) => {
          counts[label] = (counts[label] || 0) + 1;
        })
      }
    });
    // Converting counts object to an array of data values
    const dataValues = Object.values(counts);

    // console.log(counts)
    return {
      "data": dataValues,
      "labels": Object.keys(counts)
    }
  }


  getDestructuredChartOutput(dataArr: any, field_name: string) {
    let details: any = {
      labels: [],
      data: [],
    };
    for (const obj of dataArr) {
      let field_value: any = obj[field_name]
      if (Array.isArray(field_value)) {
        field_value = this.destructureArray(field_value, 'array');
        for (const value of field_value) {
          const index = details.labels.indexOf(value);
          if (index === -1) {
            details.labels.push(value);
            details.data.push(1);
          } else {
            details.data[index]++;
          }
        }
      } else {
        const index = details.labels.indexOf(field_value);
        if (index === -1) {
          details.labels.push(field_value);
          details.data.push(1);
        } else {
          details.data[index]++;
        }
      }
    }
    return details;
  }

  destructureArray(data: any, type: any) {
    let arr = data.filter((obj: any) => {
      return obj.fieldValue == true
    });
    if (type == 'string') {
      arr = arr.reduce((initialValue: any, obj: any) => {
        return initialValue + ' ' + obj.fieldName.toUpperCase()
      }, '')
    } else {
      arr = arr.reduce((initialValue: any, obj: any) => {
        return [...initialValue, obj.fieldName.toUpperCase()]
      }, [])
    }

    return arr
  }

  onClickCardBox(cardName:any){
    console.log(cardName)
    switch(cardName){
      case 'customers':
        this.exportAsXLSX(this.entities, cardName);
        break;
      case 'services':
        this.exportAsXLSX(this.listOfServices, cardName);
        break;
      case 'invoices':
        this.exportAsXLSX(this.inVoicesList, cardName);
        break;
      default:
        console.log('invalid card clicked!')
    }
  }

  exportAsXLSX(data:any, filename:any):void {
    this.excelService.exportAsExcelFile(data, filename);
  }

}



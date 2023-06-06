import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NavigationService } from 'src/app/services/navigation.service';
import { CommonService } from 'src/app/services/common.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CryptoService } from 'src/app/services/crypto.service';
import * as moment from 'moment';

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
  pieChartData: any;
  pieChartOptions: any;
  tableQuery: string = ''
  chartBackgroundColors = ['#EA6A47', '#1C4E80', "#0091D5", "#A5D8DD", '#7E909A', '#202020'];
  chartHoverBackgroundColors = ["#EF886C", "#256687", "#0AB1FF", "#C4E6E9", "#8D9DA5", "#3D3D3D"]
  inVoicesList: any;
  totalRevenue = 0
  selectedDates: { startDate: moment.Moment, endDate: moment.Moment };
  alwaysShowCalendars: boolean;
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

  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];

  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }

  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private commonService: CommonService,
    private errorHandlingService: ErrorHandlingService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.alwaysShowCalendars = true;
  }

  ngOnInit() {
    // this.iterateTableFields();
  }

  getInvoiceDetails(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "queryData": queryData || {}
    }
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
        this.inVoicesList = res.data;
        this.totalRevenue = 0;
        let products:any = []
        this.inVoicesList.forEach((data:any)=>{
          products.push(
            ...data.products.map((value:any)=>value)
          )
          this.totalRevenue = this.totalRevenue+data.finalTotal;
        })
        let barDetails: any = this.getDestructuredBarChart(products, 'name');
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
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
                color: '#000'
              }
            }
          }
        }
        this.dynamicChartDetails.push({
          chartType: 'bar',
          chartFieldName: 'services',
          chartName: "Services",
          chartData: serviceChartData,
          chartOptions: serviceChartOptions
        })
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getAllEntity(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": queryData || {}
    }
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
        this.dynamicChartDetails = []
        this.entities = []
        this.entities = res.data;
        this.createDynamicChartArr()
      }
    }, (err: any) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  getStringfiyData(data: any) {
    return JSON.stringify(data);
  }

  loadChartsData() {
    for (const response of this.entities) {
      for (const chartDetail of this.dynamicChartDetails) {
        const fieldValue = response[chartDetail.chartFieldName];
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach(value => {
            chartDetail.chartData.labels.push(value);
            chartDetail.chartData.datasets[0].data.push(1); // Assuming count is 1 for each value
          });
        } else {
          chartDetail.chartData.labels.push(fieldValue);
          chartDetail.chartData.datasets[0].data.push(1); // Assuming count is 1 for each value
        }
      }
    }
  }

  ngModelDateChange(event: any) {
    console.log(event)
    if (this.selectedDates?.startDate && this.selectedDates?.endDate) {
      this.tableQuery = JSON.stringify({
        createdAt: {
          $gte: this.selectedDates.startDate.toISOString(),
          $lte: this.selectedDates.endDate.toISOString()
        }
      })
      this.getAllEntity(JSON.parse(this.tableQuery))
      this.getInvoiceDetails(JSON.parse(this.tableQuery))
    } else {
      this.getAllEntity();
      this.getInvoiceDetails();
      this.tableQuery = JSON.stringify({})
    }
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
          console.error('Unsupported chart type:', chart.chart_type);
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



  iterateTableFields() {
    for (const field of this.userDetails?.app_meta_details?.table_fileds) {
      this.createEntitySchema(field);
    }
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

  isArrayCheck(field: any) {
    if (Array.isArray(this.entities[0][field])) {
      return true;
    }
    return false;
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

}



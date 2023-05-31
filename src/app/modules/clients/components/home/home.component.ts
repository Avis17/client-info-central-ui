import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/services/navigation.service';
import { CommonService } from 'src/app/services/common.service';
import { EntityService } from '../../services/entity.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { Table } from 'primeng/table'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],

})
export class HomeComponent implements OnInit {

  entities: any = [];
  cols: any = [];
  ref: DynamicDialogRef;
  userDetails: any;
  entitySchema: any = [];
  dynamicChartDetails: any = [];
  pieChartData: any;
  pieChartOptions: any;
  @ViewChild('tableref') dt: Table | any;

  chartBackgroundColors = ['#EA6A47', '#1C4E80', "#0091D5", "#A5D8DD", '#7E909A', '#202020'];
  chartHoverBackgroundColors = ["#EF886C", "#256687", "#0AB1FF", "#C4E6E9", "#8D9DA5", "#3D3D3D"]
  constructor(
    private entityService: EntityService,
    private authService: AuthGuardService,
    private router: Router,
    private commonService: CommonService,
    private errorHandlingService: ErrorHandlingService,
    private navigationService: NavigationService
  ) {
    // console.log(this.authService.getUserDetails())
    this.userDetails = this.authService.getUserDetails();
    console.log(this.userDetails)
  }

  ngOnInit() {
    this.iterateTableFields();
    this.getAllEntity();
  }

  onAddUSer() {
    const commands = ['/client/dynamic-forms'];
    this.navigationService.navigateWithoutLocationChange(commands);
  }

  getAllEntity() {
    const formData = {
      "schema": this.entitySchema,
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.dbName) || 'kuat-technologies',
      "collectionName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.db_details?.customerCollectionName) || 'students',
      "queryData": {}
    }
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      if (res) {
        // console.log(res)
        this.entities = res.data;
        this.createCols();
        // this.loadChartsData();
        this.createDynamicChartArr()
        // console.log(this.cols)
      }
    }, (err) => {
      this.errorHandlingService.errorAlertMsg(err);
    })
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

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  createDynamicChartArr() {
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
      let details = this.getDestructuredChartOutput(chart.chart_field_name);
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
          let barDetails:any = this.getDestructuredBarChart(chart.chart_field_name)
          chartDetail.chartData = {
            labels: barDetails.labels,
            datasets: [
              {
                label : "Users",
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

  applyFilterGlobal($event:any, stringVal:string) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  getDestructuredBarChart(fieldName:string){
    const labels = this.entities.map((item:any) => item[fieldName]);
    // Counting the occurrences of each createdAt value
    const counts:any = {};
    labels.forEach((label:any) => {
      // console.log(label)
      if(fieldName == 'createdAt'){
        label = new Date(label);
        label  = label.getDate() + '/' + (label.getMonth()+1) + '/' + label.getFullYear()
      }
      counts[label] = (counts[label] || 0) + 1;
    });
    // Converting counts object to an array of data values
    const dataValues = Object.values(counts);

    // console.log(counts)
    return {
      "data" : dataValues,
      "labels" : Object.keys(counts)
    }
  }


  getDestructuredChartOutput(field_name: string) {
    let details: any = {
      labels: [],
      data: [],
    };
    for (const obj of this.entities) {
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


  createCols() {
    this.cols = this.userDetails?.app_meta_details?.table_fileds.map((obj: any) => {
      return {
        header: obj.field_name,
        field: obj.field_key
      }
    })
    this.cols.push({
      header: "Created At",
      field: 'createdAt'
    })
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

  isArrayCheck(data: any) {
    if (Array.isArray(data)) {
      return true;
    } else {
      return false;
    }
  }

  destructureArray(data: any, type: any) {
    let arr = data.map((value: any) => {
      return value[0]
    }).filter((obj: any) => {
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

  // countFieldTypes(arr: any, fieldname: any) {
  //   const counts: any = {};
  //   arr.forEach((item: any) => {
  //     const value = item[fieldname];
  //     counts[value] = (counts[value] || 0) + 1;
  //   });

  //   const result = [];
  //   for (const value in counts) {
  //     result.push({ value, count: counts[value] });
  //   }

  //   return result;
  // }

}



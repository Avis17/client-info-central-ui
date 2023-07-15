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
  tableQuery: string = '';
  isLoading: boolean = true;
  // chartBackgroundColors = ['#4BCBEB', '#1BCFB4', '#fa9f1b', '#cc2b5e', '#EA6A47', '#1C4E80', "#0091D5", "#A5D8DD", '#7E909A', '#202020'];
  // chartHoverBackgroundColors = ['#ffdde1', '#A7BFE8', '#BBD2C5', '#acb6e5', "#EF886C", "#256687", "#0AB1FF", "#C4E6E9", "#8D9DA5", "#3D3D3D"]
  chartHoverBackgroundColors = ['#D8BBFE',  '#F3BCF3', '#A0F5CE',  '#FFD3C0', "#FFD670", "#C2FCF7", '#F0F0C9', '#A3E3FE', '#BBA0B2'];
  chartBackgroundColors =      ['#750EFB',  '#DA2FDA', '#15CB76',  '#FF540A', "#FFBA0A", "#15F4E1", "#C0C035", "#0DB5FD", "#8F6681"]

  // chartBackgroundColors = ['#ee9ca7', '#6190E8', '#536976', '#86fde8', '#EA6A47', '#1C4E80', "#0091D5", "#A5D8DD", '#7E909A', '#202020'];
  // chartHoverBackgroundColors = ['#ffdde1', '#A7BFE8', '#BBD2C5', '#acb6e5', "#EF886C", "#256687", "#0AB1FF", "#C4E6E9", "#8D9DA5", "#3D3D3D"]
  inVoicesList: any;
  totalRevenue = 0;

  listOfServices: any = []
  aggregatedDats: any;
  serviceChartDays: any;
  netProfitAndExpenses: any;
  progressServiceList: any = []
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
  selectedDates: { startDate: moment.Moment, endDate: moment.Moment };
  alwaysShowCalendars: boolean;
  invalidDates: moment.Moment[] = [moment().add(2, 'days'), moment().add(3, 'days'), moment().add(5, 'days')];
  selectedPeriod: any = 'Overall Datas';
  customDayLabels = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];
  customChartFilter = [
    {
      label: 'Last 31 Days Records',
    },
    {
      label: 'Last 12 Months Records',
    },
    {
      label: 'All Records in Years',
    },
  ];
  selectedChartFilterData = {
    label: 'Last 31 Days Records',
  };
  employeeAggregateData: any;
  monthyProfitdata: any;
  monthyProfitoptions: any;
  isInvalidDate = (current: moment.Moment) => {
    const currentDate = moment();
    return current.isAfter(currentDate, 'day'); // Disable future dates
  };

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
    const previousUrl = this.navigationService.getPreviousUrl();
  }

  ngOnInit() {
  }

  loadServicesChart(invoices: any) {
    let response = invoices.map((data: any) => {
      return data.products
    })
    this.listOfServices = this.flattenArray(response);
    console.log(this.listOfServices)
    this.progressServiceList = this.getServiceStats(this.listOfServices);
    // console.log(this.progressServiceList)
    let barDetails: any = this.getDestructuredBarChart(this.listOfServices, 'categoryName');
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

  onChangeChartFilterOptions(event: any) {
    const chartDetail = {
      chartType: 'bar',
      chartFieldName: 'createdAt',
      chartName: "Customers",
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
    console.log(event.value)
    if (event.value) {
      if (event.value.label == 'Last 31 Days Records') {
        let barDetails: any = this.getDestructuredBarChart(this.entities, 'createdAt', 'days')
        chartDetail.chartData = {
          labels: barDetails.labels.slice(0, 31),
          datasets: [
            {
              label: 'Customers',
              data: barDetails.data.slice(0, 31),
              backgroundColor: this.chartBackgroundColors,
              hoverBackgroundColor: this.chartHoverBackgroundColors
            }
          ]
        };
        this.dynamicChartDetails = this.dynamicChartDetails.filter((data: any) => {
          return data.chartFieldName != 'createdAt'
        })
        this.dynamicChartDetails.push(chartDetail);
      } else if (event.value.label == 'Last 12 Months Records') {
        let barDetails: any = this.getDestructuredBarChart(this.entities, 'createdAt', 'months')
        chartDetail.chartData = {
          labels: barDetails.labels.slice(0, 12),
          datasets: [
            {
              label: 'Customers',
              data: barDetails.data.slice(0, 12),
              backgroundColor: this.chartBackgroundColors,
              hoverBackgroundColor: this.chartHoverBackgroundColors
            }
          ]
        };
        this.dynamicChartDetails = this.dynamicChartDetails.filter((data: any) => {
          return data.chartFieldName != 'createdAt'
        })
        this.dynamicChartDetails.push(chartDetail);
      } else if (event.value.label == 'All Records in Years') {
        let barDetails: any = this.getDestructuredBarChart(this.entities, 'createdAt', 'year')
        chartDetail.chartData = {
          labels: barDetails.labels,
          datasets: [
            {
              label: 'Customers',
              data: barDetails.data,
              backgroundColor: this.chartBackgroundColors,
              hoverBackgroundColor: this.chartHoverBackgroundColors
            }
          ]
        };
        this.dynamicChartDetails = this.dynamicChartDetails.filter((data: any) => {
          return data.chartFieldName != 'createdAt'
        })
        this.dynamicChartDetails.push(chartDetail);
      }
    } else {
      let barDetails: any = this.getDestructuredBarChart(this.entities, 'createdAt', 'days')
      chartDetail.chartData = {
        labels: barDetails.labels.slice(0, 31),
        datasets: [
          {
            label: 'Customers',
            data: barDetails.data.slice(0, 31),
            backgroundColor: this.chartBackgroundColors,
            hoverBackgroundColor: this.chartHoverBackgroundColors
          }
        ]
      };
      this.dynamicChartDetails = this.dynamicChartDetails.filter((data: any) => {
        return data.chartFieldName != 'createdAt'
      })
      this.dynamicChartDetails.push(chartDetail);
    }
  }

  getServiceStats(services: any[]): any[] {
    const serviceStats: { [name: string]: { count: number, percent: string, categoryName: string } } = {};

    const totalCount = services.length;

    for (const service of services) {
      const serviceName = service.name;

      if (serviceStats[serviceName]) {
        serviceStats[serviceName].count++;
      } else {
        serviceStats[serviceName] = {
          count: 1,
          percent: '',
          categoryName: service.categoryName
        };
      }
    }

    const result: any[] = [];
    for (const serviceName in serviceStats) {
      const serviceCount = serviceStats[serviceName].count;
      const servicePercent = ((serviceCount / totalCount) * 100).toFixed(2);
      const categoryName = serviceStats[serviceName].categoryName;

      result.push({
        name: serviceName,
        count: serviceCount,
        percent: servicePercent,
        categoryName: categoryName
      });
    }

    return result;
  }


  getFilteredDatas(query: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": query
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log(res)
        return res.data;
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
      return;
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
        // console.log("entities", this.entities)
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

  getAllMonthlyInvoicesData(queryData?: any) {
    return new Promise((resolve, reject) => {
      const formData = {
        "schema": '',
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
        "collectionName": 'invoices',
        "queryData": queryData || {}
      }
      this.entityService.getAllMonthlyInvoicesData(formData).subscribe((res: any) => {
        if (res?.data) {
          console.log(res.data)
          resolve(res.data);
          if(res?.data?.length > 0){
            this.monthyProfitdata = {
              labels: res.data.map((labels:any)=>{
                const key = labels.month.split(',');
                console.log(key[0])
                return this.months[Number(key[0])-1] + "," + key[1]
              }),
              datasets: [
                {
                  label: 'Monthly Sales',
                  data: res.data.map((values:any)=>{
                    return values.amount.toFixed(0);
                  }),
                  fill: false,
                  // borderColor: documentStyle.getPropertyValue('--blue-500'),
                  tension: 0.4
                }
              ]
            };
  
            this.monthyProfitoptions = {
              maintainAspectRatio: false,
              aspectRatio: 0.6,
              plugins: {
                legend: {
                  labels: {
                    // color: textColor
                  }
                }
              },
              scales: {
                x: {
                  ticks: {
                    // color: textColorSecondary
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


            console.log(this.monthyProfitdata);
          }
        }
      }, (err: any) => {
        this.errorHandlingService.errorAlertMsg(err);
        reject(err);
      })
    });
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
      try {
        this.isLoading = true;
        const monthlyInvoicesDataPromise = this.getAllMonthlyInvoicesData(JSON.parse(this.tableQuery));
        const chartDataPromise = this.getAllServiceChartDatas(JSON.parse(this.tableQuery));
        const invoicesPromise = this.getCustomersInvoicesEntity(JSON.parse(this.tableQuery));
        const netProfitPromise = this.getNetProfitAndExpense(JSON.parse(this.tableQuery));
        const [chartData, invoices, netProfit, monthlyInvoicesData] = await Promise.all([chartDataPromise, invoicesPromise, netProfitPromise, monthlyInvoicesDataPromise]);
        this.isLoading = false;
      } catch (error) {
        // Handle any errors that occurred during the API calls
        console.error(error);
        // Set the loader state to false in case of any failure
        this.isLoading = false;
      }
    } else {
      // this.getAllAggregateDatas();
      this.tableQuery = JSON.stringify({
        createdAt: {
          startDate: new Date(this.userDetails?.app_meta_details?.createdAt),
          endDate: new Date()
        }
      })
      try {
        const monthlyInvoicesDataPromise = this.getAllMonthlyInvoicesData(JSON.parse(this.tableQuery));
        const chartDataPromise = this.getAllServiceChartDatas(JSON.parse(this.tableQuery));
        const invoicesPromise = this.getCustomersInvoicesEntity();
        const netProfitPromise = this.getNetProfitAndExpense();
        const [chartData, invoices, netProfit, monthlyInvoicesData] = await Promise.all([chartDataPromise, invoicesPromise, netProfitPromise, monthlyInvoicesDataPromise]);
        this.isLoading = false;
      } catch (error) {
        // Handle any errors that occurred during the API calls
        console.error(error);
        // Set the loader state to false in case of any failure
        this.isLoading = false;
      }
      this.tableQuery = JSON.stringify({})
    }
  }

  getAllServiceChartDatas(queryData?: any) {
    return new Promise((resolve, reject) => {
      const formData = {
        "schema": '',
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
        "collectionName": 'invoices',
        "queryData": queryData
      };

      this.entityService.getAllServiceChartDatas(formData).subscribe(
        (res: any) => {
          if (res) {
            this.serviceChartDays = res.data;
            // console.log(this.serviceChartDays);
            resolve(this.serviceChartDays);
          }
        },
        (err: any) => {
          this.errorHandlingService.errorAlertMsg(err);
          reject(err);
        }
      );
    });
  }

  getCustomersInvoicesEntity(queryData?: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'customers',
      "queryData": queryData || {}
    };

    return new Promise((resolve, reject) => {
      this.entityService.getCustomersInvoicesEntity(formData).subscribe(
        (res: any) => {
          if (res?.data) {
            console.log(res.data);
            this.aggregatedDats = res.data;
            this.dynamicChartDetails = [];
            this.entities = [];
            this.inVoicesList = [];
            this.entities = res.data.customers;
            // console.log("entities", this.entities)
            this.inVoicesList = res.data.invoicesList;
            this.createDynamicChartArr();
            this.loadServicesChart(res.data.invoicesList);
            resolve(res.data); // Resolve with the actual data
          } else {
            reject(new Error("Failed to get customers invoices entity"));
          }
        },
        (err: any) => {
          this.errorHandlingService.errorAlertMsg(err);
          reject(err);
        }
      );
    });
  }

  onChartPointSelect(event: any, chartName: any, dataArr: any) {
    // Access the selected value from the event object
    const index = event.element.index;
    let filterdDetails: any;
    let key = dataArr.labels[index].toLowerCase();


    // this.getFilteredDatas({[chartName]:key});
    if (this.isArrayCheck(chartName)) {
      filterdDetails = this.entities.filter((value: any) => {
        return value[chartName].some((data: any) => data.fieldName === key && data.fieldValue);
      })
    }
    else if (this.isDateField(this.entities[0][chartName])) {
      filterdDetails = this.entities.filter((value: any) => {
        return this.getDateFormated(new Date(value[chartName])) == key
      })
    } else {
      filterdDetails = this.entities.filter((value: any) => {
        return value[chartName] == dataArr.labels[index]
      })
    }

    this.entityService.updateTableData(filterdDetails);
    const commands = ['/client/clients'];
    this.navigationService.navigateWithoutLocationChange(commands);
    // this.exportAsXLSX(filterdDetails, chartName);
  }

  navigateToUserTableComponent(data: any) {
    const commands = ['/client/clients'];
    console.log(data)
    this.navigationService.navigateWithoutLocationChange(commands, {
      state: {
        tableData: JSON.stringify(data) // Convert tableData to a string if it's an object
      }
    });
  }

  isDateField(value: any): boolean {
    if (typeof value !== 'string') {
      return false; // Return false if the value is not a string
    }

    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }

  getNetProfitAndExpense(queryData?: any) {
    return new Promise((resolve, reject) => {
      const formData = {
        "schema": '',
        "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
        "collectionName": 'invoices',
        "queryData": queryData
      };

      this.entityService.getNetProfitAndExpense(formData).subscribe(
        (res: any) => {
          if (res) {
            this.netProfitAndExpenses = res.data;
            this.getAllEmployeeAggregateDatas(JSON.parse(this.tableQuery))
            if (this.netProfitAndExpenses.netProfit) {
              this.netProfitAndExpenses.netProfit = this.netProfitAndExpenses?.netProfit?.toFixed(2);
            }
            // console.log(this.netProfitAndExpenses);
            resolve(this.netProfitAndExpenses);
          }
        },
        (err: any) => {
          this.errorHandlingService.errorAlertMsg(err);
          reject(err);
        }
      );
    });
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
        this.employeeAggregateData = res.data;
        if (this.employeeAggregateData?.totalNetSalaryGiven) {
          this.netProfitAndExpenses.totalExpenses = this.netProfitAndExpenses?.totalExpenses + this.employeeAggregateData?.totalNetSalaryGiven;
          this.netProfitAndExpenses.totalExpenses = this.netProfitAndExpenses.totalExpenses.toFixed(2);
          this.netProfitAndExpenses.netProfit = this.netProfitAndExpenses?.netProfit - this.employeeAggregateData?.totalNetSalaryGiven;
          this.netProfitAndExpenses.netProfit = this.netProfitAndExpenses.netProfit?.toFixed(2)
        }
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
        })?.field_name || '',
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
          let barDetails: any = this.getDestructuredBarChart(this.entities, chart.chart_field_name, 'days')
          chartDetail.chartData = {
            labels: barDetails.labels.slice(0, 31),
            datasets: [
              {
                label: chart.chart_field_name == 'createdAt' ? "Customers" : chart.chart_field_name.toUpperCase(),
                data: barDetails.data.slice(0, 31),
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


  getDestructuredBarChart(dataArr: any, fieldName: string, type?: string) {
    const labels = dataArr.map((item: any) => item[fieldName]);
    // Counting the occurrences of each createdAt value
    const counts: any = {};
    labels.forEach((label: any) => {
      // console.log(label)
      if (!Array.isArray(label)) {
        if (fieldName == 'createdAt') {
          if (type == 'days') {
            label = new Date(label);
            label = this.getDateFormated(label)
          } else if (type == 'months') {
            label = (new Date(label).getMonth() + 1);
            label = this.months[label]
          } else if (type == 'year') {
            label = new Date(label).getFullYear()
          }
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

  getDateFormated(date: any) {
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
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


  getDestructuredChartOutput(dataArr: any, field_name: string) {
    let details: any = {
      labels: [],
      data: [],
    };
    for (const obj of dataArr) {
      let field_value: any = obj[field_name];
      if (Array.isArray(field_value)) {
        field_value = this.destructureArray(field_value, 'array');
        for (const value of field_value) {
          const index = details.labels.findIndex((label: any) =>
            label.toLowerCase() === value.toLowerCase()
          );
          if (index === -1) {
            details.labels.push(value);
            details.data.push(1);
          } else {
            details.data[index]++;
          }
        }
      } else {
        const index = details.labels.findIndex((label: any) =>
          label.toLowerCase() === field_value.toLowerCase()
        );
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

  onClickCardBox(cardName: any) {
    // console.log(cardName)
    switch (cardName) {
      case 'customers':
        // this.exportAsXLSX(this.entities, cardName);
        this.entityService.updateTableData(this.entities);
        const commands = ['/client/clients'];
        this.navigationService.navigateWithoutLocationChange(commands);
        break;
      case 'products':
        this.exportAsXLSX(this.listOfServices, cardName);
        break;
      case 'invoices':
        this.exportAsXLSX(this.inVoicesList, cardName);
        break;
      default:
      // console.log('invalid card clicked!')
    }
  }

  exportAsXLSX(data: any, filename: any): void {
    this.excelService.exportAsExcelFile(data, filename);
  }

  isArrayCheck(field: any) {
    if (Array.isArray(this.entities[0][field])) {
      return true;
    }
    return false;
  }

}



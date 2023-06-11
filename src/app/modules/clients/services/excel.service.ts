import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  // public exportAsExcelFile(json: any[], excelFileName: string): void {
  //   const dataWithoutIdAndVersion = json.map(obj => {
  //     const { _id, __v, ...rest } = obj;
  //     for (const key in rest) {
  //       if (Array.isArray(rest[key])) {
  //         rest[key] = JSON.stringify(rest[key]);
  //       }
  //     }
  //     return rest;
  //   });
  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataWithoutIdAndVersion);
  //   console.log('worksheet', worksheet);
  //   const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //   //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  //   this.saveAsExcelFile(excelBuffer, excelFileName);
  // }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const dataWithoutIdAndVersion = json.map(obj => {
      const { _id, __v, isUniqueField, ...rest } = obj;
      const interestedFields = Object.entries(rest)
        .filter(([key, value]: any) => Array.isArray(value))
        .map(([key, value]: any) => {
          const filteredValues = value.filter((data: any) => {
            return data?.fieldValue
          }).map((data: any) => {
            return data.fieldName
          })
          rest[key] = filteredValues.join(', ')
        });
      return { ...rest };
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataWithoutIdAndVersion);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }


  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}

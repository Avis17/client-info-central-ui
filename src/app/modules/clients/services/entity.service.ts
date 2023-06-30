import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {delay, map} from 'rxjs/operators';
import { CryptoService } from 'src/app/services/crypto.service';
import { Schema } from 'mongoose';
import { environment } from 'src/environment/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor(private http:HttpClient, private cryptoService:CryptoService) { }

  invoiceDetails:any;
  URL = environment.apiUrl+'entities/';
  entitySchema :any = {}
  formType:string = ''
  private tableDataSubject = new BehaviorSubject<any>(null);
  public tableData$ = this.tableDataSubject.asObservable();


  updateTableData(tableData: any) {
    this.tableDataSubject.next(tableData);
  }

  setFormType(type:string){
    this.formType = type
  }

  getFormType(){
    return this.formType
  }

  getInvoiceDetails(){
    return this.invoiceDetails;
  }

  setinvoiceDetails(details:any){
    this.invoiceDetails = details;
  }

  addNewInvoiceEntity(data:any){
    return this.http.post(this.URL+'upload-invoice', data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  addNewEntity(data:any){
    return this.http.post(this.URL, data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  getAllEntities(data:any){
    return this.http.post(this.URL+'get-all-entities', data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  getAllAggregateDatas(data:any){
    return this.http.post(this.URL+'get-all-aggregates-entities', data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  getAllServiceChartDatas(data:any){
    return this.http.post(this.URL+'get-chart-datas-for-services', data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  getNetProfitAndExpense(data:any){
    return this.http.post(this.URL+'get-expense-profit-datas', data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  updateEntityById(id:any, data:any){
    return this.http.put(this.URL+"update-entity-by-id/"+id, data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  deleteEntityById(id:any, data:any){
    return this.http.post(this.URL+"delete-entity-by-id/"+id, data);
  }

  getEntitySchema(){
    return this.entitySchema
  }

  // get-customer-services-entities

  getCustomersInvoicesEntity(data:any){
    return this.http.post(this.URL+'get-customer-services-entities', data).pipe(
      map((response:any) => {
       if(response.status == 200){
        let decryptRes = {
          ...response,
          data : JSON.parse(this.cryptoService.decrypt(response.data))
         }
         return decryptRes;
       }
       return response
     })
    );
  }

  setEntitySchema(schema:any){
    this.entitySchema = schema
  }
}

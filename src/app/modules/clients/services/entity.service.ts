import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {delay, map} from 'rxjs/operators';
import { CryptoService } from 'src/app/services/crypto.service';
import { Schema } from 'mongoose';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor(private http:HttpClient, private cryptoService:CryptoService) { }

  URL : string = 'http://localhost:2000/entities/';
  entitySchema :any = {}
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
    return this.http.put(this.URL+"delete-entity-by-id/"+id, data).pipe(
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

  getEntitySchema(){
    return this.entitySchema
  }

  setEntitySchema(schema:any){
    this.entitySchema = schema
  }
}

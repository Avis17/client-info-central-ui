import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators';
import { CryptoService } from 'src/app/services/crypto.service';

@Injectable({
  providedIn: 'root'
})
export class AppMetaCreationService {

  constructor(private http:HttpClient, private cryptoService:CryptoService) { }

  URL = "http://localhost:2000/app-meta-creation/";

  getAppCategories(){
    return this.http.get(this.URL+"get-app-categories").pipe(
      map((response:any) => {
       let decryptRes = {
        ...response,
        data : JSON.parse(this.cryptoService.decrypt(response.data))
       }
       return decryptRes;
     })
    );
  }

  
  createNewAppMeta(data:any){
    return this.http.post(this.URL+"create-new-app-meta", data).pipe(
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

  deleteAppMeta(_id:string){
    return this.http.post(this.URL+"delete-app-meta", {_id}).pipe(
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

  getAllAppMetas(query:any){
    return this.http.post(this.URL+"get-app-metas", {query}).pipe(
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

}



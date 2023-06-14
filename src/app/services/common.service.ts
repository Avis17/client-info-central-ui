import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  toTitleCase(str:string) {
    return str.toLowerCase().split(' ').map(function (word) {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

  toMongodbCase(str:string) {
    if(!str) return str
    return str.toLowerCase().split(' ').join('_');
  }
  

}

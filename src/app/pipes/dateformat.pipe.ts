import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateformat'
})
export class DateformatPipe implements PipeTransform {

  transform(value: string) {
    var datePipe = new DatePipe("en-US");
     value = datePipe.transform(value, 'dd/MM/yyyy') || value;
     return value;
 }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, args?: any, property?: any): any {
    if (!value) return null;
    if (!args) return value;
    args = args.toLowerCase();
  
    return value.filter(function (data: any) {
      if (property) {
        return data[property].some((item: any) => item.itemName.toLowerCase().includes(args));
      } else {
        return JSON.stringify(data).toLowerCase().includes(args);
      }
    });
  }
}

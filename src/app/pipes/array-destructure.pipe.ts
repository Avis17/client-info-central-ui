import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayDestructure'
})
export class ArrayDestructurePipe implements PipeTransform {

  transform(value: any): any {
    let arr = value.map((value: any) => {
      return value[0]
    }).filter((obj: any) => {
      return obj.fieldValue == true
    }).reduce((initialValue: any, obj: any) => {
      return initialValue + ' ' + obj.fieldName.toUpperCase()
    }, '')
    return arr
  }

}

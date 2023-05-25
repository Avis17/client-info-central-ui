import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(private router: Router) { }

  navigateWithoutLocationChange(commands: any[], extras?: NavigationExtras) {
    const navigationExtras: NavigationExtras = {
      ...extras,
      skipLocationChange: true
    };

    this.router.navigate(commands, navigationExtras);
  }
}
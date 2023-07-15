import { Injectable } from '@angular/core';
import { Router, NavigationExtras, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private previousUrl: string;

  constructor(private router: Router) {
    // this.initializePreviousUrl();
  }

  private initializePreviousUrl() {
    if (!sessionStorage.getItem('previousUrl')) {
      window.onbeforeunload = () => {
        sessionStorage.setItem('previousUrl', this.router.url);
      };
    }

    this.previousUrl = sessionStorage.getItem('previousUrl') || '/';
    sessionStorage.removeItem('previousUrl');
  }

  navigateWithoutLocationChange(commands: any[], extras?: NavigationExtras) {
    const navigationExtras: NavigationExtras = {
      ...extras,
      skipLocationChange: true
    };

    this.router.navigate(commands, navigationExtras);
  }

  getPreviousUrl(): string {
    return this.previousUrl;
  }
}
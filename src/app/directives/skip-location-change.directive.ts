import { Directive, HostListener, Input } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Directive({
  selector: '[appSkipLocationChange]'
})
export class SkipLocationChangeDirective {

  @Input('commands') commands: any;
  // <a skipLocationChange [commands]="['/product']">Go to Product</a>

  constructor(private router: Router) { }

  @HostListener('click')
  onClick() {
    const navigationExtras: NavigationExtras = {
      skipLocationChange: true
    };

    this.router.navigate(this.commands, navigationExtras);
  }

}

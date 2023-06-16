import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-custom-loader',
  templateUrl: './custom-loader.component.html',
  styleUrls: ['./custom-loader.component.scss']
})
export class CustomLoaderComponent {
  zIndexValue = 1000;
  color = '#FFF';
  @Input()
  set setZIndex(zIndexValue: number) {
    this.zIndexValue = zIndexValue;
  }

  constructor() {
    window.scrollTo(0, 0); // Scroll to the top
  }
}

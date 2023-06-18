import { Component, ViewChild, ElementRef } from '@angular/core';
import { jsPDF } from "jspdf";
// import 'jspdf-autotable';

@Component({
  selector: 'app-new-bill',
  templateUrl: './new-bill.component.html',
  styleUrls: ['./new-bill.component.scss']
})
export class NewBillComponent {

  @ViewChild('content') content: ElementRef;

  generatePDF() {
    const doc = new jsPDF();
    const content = this.content.nativeElement;
  
    doc.html(content, {
      callback: function (pdf) {
        pdf.save('document.pdf');
      }
    });
  }
}

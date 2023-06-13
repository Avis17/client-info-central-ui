import { Component, OnDestroy, Input, OnInit } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { EntityService } from '../../services/entity.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CommonService } from 'src/app/services/common.service';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-rebill',
  templateUrl: './rebill.component.html',
  styleUrls: ['./rebill.component.scss']
})
export class RebillComponent implements OnInit{

  userDetails: any;

  @Input()
  invoiceDetails:any;

  termsList: any = [
    { terms: "Order can be return in max 10 days." },
    { terms: "Warrenty of the product will be subject to the manufacturer terms and conditions." },
    { terms: "This is system generated invoice." }
  ]

  constructor(
    private authService: AuthGuardService,
    private entityService: EntityService,
    private navigationService: NavigationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.invoiceDetails = entityService.getInvoiceDetails();
  }

  ngOnInit(): void {
    this.generatePDF();
  }

  createPDFData() {
    const upiId = this.userDetails?.app_meta_details?.billingdetails?.upiId || ''; // Replace with your actual UPI ID
    const paymentAmount = this.invoiceDetails.finalTotal; // Retrieve the payment amount from the invoice

    // Generate the payment URL using the UPI ID and amount
    const paymentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Your%20Company&mc=your-merchant-code&tid=your-transaction-id&tr=your-transaction-reference-id&tn=Invoice%20Payment&am=${paymentAmount}&cu=INR`;

    const logo = this.userDetails?.app_meta_details?.billingdetails?.logo;
    const logoStack = [];
    if (logo && logo != 'undefined') {
      logoStack.push({
        image: logo,
        width: 100,
        height: 100
      });
    }
    return {
      content: [
        {
          columns: [
            {
              width: 'auto',
              stack: logoStack,
              alignment: 'left',
              margin: [0, 0, 20, 0]
            },
            {
              stack: [
                {
                  text: 'INVOICE',
                  fontSize: 24,
                  bold: true,
                  alignment: 'right',
                  color: '#1C4E80', // Blue color
                  margin: [0, 0, 0, 10]
                },
                {
                  text: this.userDetails?.app_meta_details?.company_name,
                  fontSize: 16,
                  bold: true,
                  alignment: 'right',
                  color: '#CC5803', // Red color
                  margin: [0, 0, 0, 5]
                },
                {
                  text: this.userDetails?.app_meta_details?.billingdetails?.company_address,
                  fontSize: 10,
                  alignment: 'right',
                  margin: [0, 0, 0, 5]
                },
                {
                  text: this.userDetails?.app_meta_details?.billingdetails?.city + ', ' + this.userDetails?.app_meta_details?.billingdetails?.state + ', ' + this.userDetails?.app_meta_details?.billingdetails?.country,
                  fontSize: 10,
                  alignment: 'right'
                },
                {
                  text: this.userDetails?.app_meta_details?.billingdetails?.gstNo,
                  fontSize: 10,
                  alignment: 'right'
                }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 20] // Add margin to increase spacing
        },
        {
          text: 'Customer Details',
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              {
                text: this.invoiceDetails?.customerName,
                bold: true,
                fontSize: 12,
                marginBottom: 5
              },
              { text: this.invoiceDetails?.address, fontSize: 10, marginBottom: 5 },
              { text: this.invoiceDetails?.email, fontSize: 10, marginBottom: 5 },
              { text: this.invoiceDetails?.phone, fontSize: 10, marginBottom: 5 },
              { text: this.invoiceDetails?.gstNo || '', fontSize: 10 }
            ],
            // Invoice Details
            [
              {
                text: `Invoice Number: ${this.invoiceDetails?.billNo}`,
                bold: true,
                fontSize: 12,
                color: '#CC5803', // Red color
                alignment: 'right'
              },
              {
                text: `Date: ${new Date().toLocaleDateString()}`,
                bold: true,
                fontSize: 12,
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: 'Invoice Items',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [{ text: 'Description', style: 'tableHeader' }, { text: 'Price', style: 'tableHeader' }, { text: 'Quantity', style: 'tableHeader' }, { text: 'Amount', style: 'tableHeader' }],
              ...this.invoiceDetails?.products.map((p:any) => [p.name, p.price, p.qty, (p.price * p.qty).toFixed(2)]),
              [{ text: '', colSpan: 4, fillColor: '#ffffff' }], // Empty row
              [
                { text: 'Subtotal', colSpan: 3, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                { text: this.invoiceDetails?.subTotal, alignment: 'right', fillColor: '#eaeaea' }
              ],
              [
                { text: 'GST', colSpan: 3, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                { text: this.invoiceDetails?.cgst + '%', alignment: 'right', fillColor: '#eaeaea' }
              ],
              [
                { text: 'Total', colSpan: 3, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                { text: "Rs." + this.invoiceDetails?.finalTotal, alignment: 'right', fillColor: '#eaeaea', color: '#CC5803' }
              ]
            ]
          },
          layout: {
            vLineWidth: function (i: any, node: any) { return 0; }, // Remove vertical borders
            hLineWidth: function (i: any, node: any) { return 0; }, // Remove horizontal borders
            paddingLeft: function (i: any, node: any) { return 8; }, // Add left padding to align text
            paddingRight: function (i: any, node: any) { return 8; }, // Add right padding to align text
            paddingTop: function (i: any, node: any) { return 8; }, // Add top padding to all rows except the header
            paddingBottom: function (i: any, node: any) { return 8; } // Add bottom padding to all rows except the header
          },
          margin: [0, 10, 0, 20] // Add margin to increase spacing
        },
        {
          text: 'Terms & Conditions',
          style: 'sectionHeader'
        },
        this.termsList.map((term: any) => {
          return {
            text: term.terms,
            fontSize: 10,
            margin: [0, 0, 0, 5] // Add margin to increase spacing
          };
        }),
        {
          columns: [
            { width: '*', text: '' }, // Empty column to push signature to the right
            {
              width: 'auto',
              stack: [
                {
                  width: 150,
                  alignment: "right",
                  image: this.userDetails?.app_meta_details?.billingdetails?.signature,
                  margin: [0, 60, 0, 3],
                },
                { text: 'Authorized Signature', fontSize: 12, bold: true },
                // { text: 'Your Name', fontSize: 10 }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 20, 0, 0], // Add margin to increase spacing
          columnGap: 10 // Adjust the gap between columns if needed
        },
        { text: 'For Payment:-', margins: [0, 0, 0, 4] },
        {
          qr: paymentUrl,
          fit: 80, // Set the desired size of the QR code
          alignment: 'left',
          foreground: '#1C4E80',
          margin: [0, 10, 0, 10] // Add margin to increase spacing
        },
      ],
      styles: {
        tableHeader: {
          fillColor: '#eaeaea',
          color: '#333333',
          bold: true,
          fontSize: 12,
        },
        sectionHeader: {
          bold: true,
          fontSize: 12,
          margin: [0, 10, 0, 5] // Add margin to increase spacing
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  generatePDF(action = 'open') {
    if(this.invoiceDetails){
      const docDefinition: any = this.createPDFData();
      pdfMake.createPdf(docDefinition).open();
      this.navigationService.navigateWithoutLocationChange(['client/home']);
    }
  }
}

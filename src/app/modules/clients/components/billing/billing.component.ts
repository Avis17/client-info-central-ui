import { Component, OnDestroy } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { EntityService } from '../../services/entity.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CommonService } from 'src/app/services/common.service';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnDestroy {

  userDetails: any;
  gstList = [2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];
  isSubTotalClicked = false;
  isFinalTotalClicked = false;
  invoicedetails: any;
  isLoading: boolean = false;

  constructor(
    private authService: AuthGuardService,
    private entityService: EntityService,
    private navigationService: NavigationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
  ) {
    this.userDetails = this.authService.getUserDetails();
    this.invoicedetails = entityService.getInvoiceDetails();
    if (this.invoicedetails) {
      console.log(this.invoicedetails)
      if (this.invoicedetails) {
        this.invoice = new Invoice(this.invoicedetails.name, this.invoicedetails.place, this.invoicedetails.address, this.invoicedetails.email, this.invoicedetails.phone, this.invoicedetails.services)
      } else {
        this.invoice = new Invoice();
      }
    }
  }

  invoice = new Invoice();
  termsList: any = [
    { terms: "Order can be return in max 10 days." },
    { terms: "Warrenty of the product will be subject to the manufacturer terms and conditions." },
    { terms: "This is system generated invoice." }
  ]

  ngOnDestroy(): void {
    this.entityService.setinvoiceDetails({})
  }

  // createPDFData(){
  //   return {
  //     content: [ 
  //       {
  //         text: 'INVOICE',
  //         fontSize: 20,
  //         bold: true,
  //         alignment: 'center',
  //         decoration: 'underline',
  //         color: '#1C4E80'
  //       },
  //       {
  //         text: 'Customer Details',
  //         style: 'sectionHeader'
  //       },
  //       {
  //         columns: [
  //           [
  //             {
  //               text: this.invoice.customerName,
  //               bold:true
  //             },
  //             { text: this.invoice.address },
  //             { text: this.invoice.email },
  //             { text: this.invoice.phone },
  //             { text: this.invoice.gstNo || '' }
  //           ],
  //           [
  //             {
  //                 text: this.userDetails?.app_meta_details?.company_name,
  //                 fontSize: 18,
  //                 color: '#1C4E80',
  //                 alignment : 'right',
  //                 decoration: 'underline'
  //             },
  //             {
  //               text: `Date: ${new Date().toLocaleString()}`,
  //               alignment: 'right'
  //             },
  //             { 
  //               text: `Bill No : ${this.invoice.billNo}`,
  //               alignment: 'right'
  //             }
  //           ]
  //         ]
  //       },
  //       {
  //         text: 'Order Details',
  //         style: 'sectionHeader'
  //       },
  //       {
  //         table: {
  //           headerRows: 1,
  //           heights: 30,
  //           alignment : 'center',
  //           widths: ['*', 'auto', 'auto', 'auto'],
  //           body: [
  //             ['Product', 'Price', 'Quantity', 'Amount'],
  //             ...this.invoice.products.map((p:any) => [p.name, p.price, p.qty, (p.price*p.qty).toFixed(2)])
  //           ]
  //         }
  //       },
  //       {
  //         layout: {
  //           defaultBorder: false,
  //           hLineWidth: function(i:any, node:any) {
  //             return 1;
  //           },
  //           vLineWidth: function(i:any, node:any) {
  //             return 1;
  //           },
  //           hLineColor: function(i:any, node:any) {
  //             return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
  //         },
  //         vLineColor: function(i:any, node:any) {
  //             return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
  //         },
  //           hLineStyle: function(i:any, node:any) {
  //             // if (i === 0 || i === node.table.body.length) {
  //             return null;
  //             //}
  //           },
  //           // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
  //           paddingLeft: function(i:any, node:any) {
  //             return 10;
  //           },
  //           paddingRight: function(i:any, node:any) {
  //             return 10;
  //           },
  //           paddingTop: function(i:any, node:any) {
  //             return 3;
  //           },
  //           paddingBottom: function(i:any, node:any) {
  //             return 3;
  //           },
  //           fillColor: function(rowIndex:any, node:any, columnIndex:any) {
  //             return '#fff';
  //           },
  //         },
  //         style: 'tableExample',
  //         table: {
  //           headerRows: 1,
  //           widths: ['55%', '45.7%'],
  //           body: [
  //             [
  //               {
  //                 text: 'Payment Subtotal',
  //                 border: [true, true, true, true],
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 5],
  //               },
  //               {
  //                 border: [true, true, true, true],
  //                 text: this.invoice.subTotal,
  //                 alignment: 'right',
  //                 fillColor: '#f5f5f5',
  //                 margin: [0, 5, 0, 5],
  //               },
  //             ],
  //             [
  //               {
  //                 text: 'Tax SGST @ '+ this.invoice.sgst+'%',
  //                 border: [true, true, true, true],
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 5],
  //               },
  //               {
  //                 text: + this.invoice.sgstAmount,
  //                 border: [true, true, true, true],
  //                 fillColor: '#f5f5f5',
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 5],
  //               },
  //             ],
  //             [
  //               {
  //                 text: 'Tax CGST @ '+ this.invoice.cgst+'%',
  //                 border: [true, true, true, true],
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 5],
  //               },
  //               {
  //                 text: this.invoice.cgstAmount,
  //                 border: [true, true, true, true],
  //                 fillColor: '#f5f5f5',
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 5],
  //               },
  //             ],
  //             [
  //               {
  //                 text: 'Tax IGST @ ' + this.invoice.igst+'%',
  //                 border: [true, true, true, true],
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 5],
  //               },
  //               {
  //                 text: this.invoice.igstAmount,
  //                 border: [true, true, true, true],
  //                 fillColor: '#f5f5f5',
  //                 alignment: 'right',
  //                 margin: [0, 5, 0, 5],
  //               },
  //             ],
  //             [
  //               {
  //                 text: 'Total',
  //                 bold: true,
  //                 fontSize: 20,
  //                 alignment: 'right',
  //                 border: [true, true, true, true],
  //                 margin: [0, 5, 0, 5],
  //               },
  //               {
  //                 text: "Rs "+this.invoice.finalTotal,
  //                 bold: true,
  //                 fontSize: 20,
  //                 alignment: 'right',
  //                 border: [true, true, true, true],
  //                 fillColor: '#f5f5f5',
  //                 margin: [0, 5, 0, 5],
  //               },
  //             ],
  //           ],
  //         }
  //       },
  //       '\n\n',
  //       {
  //         columns: [
  //           {
  //             stack:[
  //               {
  //                 width: 150,
  //                 alignment: "right",
  //                 image: this.userDetails?.app_meta_details?.billingdetails?.signature,
  //                 margin: [0, 60, 0, 3],
  //               },
  //               {
  //                 width: '100%',
  //                 text: 'For '+this.userDetails?.app_meta_details?.company_name?.toLowerCase(),
  //                 alignment: "right",
  //                 style: 'notesText',
  //                 margin: [0, 10, 20, 3],
  //               }
  //             ]
  //           }
  //         ],
  //       },
  //       {
  //         text: 'Terms and Conditions',
  //         style: 'sectionHeader'
  //       },
  //       {
  //           ul: [...this.termsList.map((data:any) => data.terms)],
  //       }
  //     ],
  //     styles: {
  //       sectionHeader: {
  //         bold: true,
  //         decoration: 'underline',
  //         fontSize: 14,
  //         margin: [10, 15, 0, 15]          
  //       },
  //       notesText: {
  //         fontSize: 10,
  //       },
  //     }
  //   };
  // }

  // createPDFData() {
  //   return {
  //     content: [
  //       {
  //         text: 'INVOICE',
  //         fontSize: 20,
  //         bold: true,
  //         alignment: 'center',
  //         decoration: 'underline',
  //         color: '#1C4E80',
  //         margin: [0, 0, 0, 20] // Add margin to increase spacing
  //       },
  //       {
  //         text: 'Customer Details',
  //         style: 'sectionHeader'
  //       },
  //       {
  //         columns: [
  //           [
  //             {
  //               text: this.invoice.customerName,
  //               bold: true,
  //               fontSize: 12,
  //               marginBottom: 5
  //             },
  //             { text: this.invoice.address, fontSize: 10, marginBottom: 5 },
  //             { text: this.invoice.email, fontSize: 10, marginBottom: 5 },
  //             { text: this.invoice.phone, fontSize: 10, marginBottom: 5 },
  //             { text: this.invoice.gstNo || '', fontSize: 10 }
  //           ],
  //           [
  //             {
  //               text: this.userDetails?.app_meta_details?.company_name,
  //               fontSize: 18,
  //               bold: true,
  //               alignment: 'right',
  //               margin: [0, 20, 0, 0] // Add margin to increase spacing
  //             },
  //             {
  //               text: `Invoice Number: ${this.invoice.billNo}`,
  //               bold: true,
  //               fontSize: 12,
  //               alignment: 'right'
  //             },
  //             {
  //               text: `Date: ${new Date().toLocaleDateString()}`,
  //               bold: true,
  //               fontSize: 12,
  //               alignment: 'right'
  //             },
  //             {
  //               text: `Due Date: ${new Date().toLocaleDateString()}`,
  //               bold: true,
  //               fontSize: 12,
  //               alignment: 'right'
  //             }
  //           ]
  //         ]
  //       },
  //       {
  //         text: 'Services',
  //         style: 'sectionHeader'
  //       },
  //       {
  //         table: {
  //           headerRows: 1,
  //           widths: ['*', 'auto', 'auto', 'auto'],
  //           body: [
  //             ['Description', 'Price', 'Quantity', 'Amount'],
  //             ...this.invoice.products.map((p: any) => [p.name, p.price, p.qty, (p.price * p.qty).toFixed(2)]),
  //             [
  //               { text: 'Subtotal', colSpan: 3, alignment: 'right', bold: true },
  //               {},
  //               {},
  //               { text: this.invoice.subTotal, alignment: 'right' }
  //             ],
  //             [
  //               { text: 'GST', colSpan: 3, alignment: 'right', bold: true },
  //               {},
  //               {},
  //               { text: this.invoice.cgst, alignment: 'right' }
  //             ],
  //             [
  //               { text: 'Total', colSpan: 3, alignment: 'right', bold: true },
  //               {},
  //               {},
  //               { text: this.invoice.finalTotal, alignment: 'right' }
  //             ]
  //           ]
  //         },
  //         layout: 'lightHorizontalLines',
  //         margin: [0, 10, 0, 20] // Add margin to increase spacing
  //       },
  //       {
  //         text: 'Terms & Conditions',
  //         style: 'sectionHeader'
  //       },
  //       this.termsList.map((term:any) => {
  //         return {
  //           text: term.terms,
  //           fontSize: 10,
  //           margin: [0, 0, 0, 5] // Add margin to increase spacing
  //         };
  //       })
  //     ],
  //     styles: {
  //       sectionHeader: {
  //         bold: true,
  //         fontSize: 12,
  //         margin: [0, 10, 0, 5] // Add margin to increase spacing
  //       }
  //     },
  //     defaultStyle: {
  //       fontSize: 10
  //     }
  //   };
  // }

  createPDFData() {
    const upiId = this.userDetails?.app_meta_details?.billingdetails?.upiId || ''; // Replace with your actual UPI ID
    const paymentAmount = this.invoice.finalTotal; // Retrieve the payment amount from the invoice

    // Generate the payment URL using the UPI ID and amount
    const paymentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Your%20Company&mc=your-merchant-code&tid=your-transaction-id&tr=your-transaction-reference-id&tn=Invoice%20Payment&am=${paymentAmount}&cu=INR`;

    return {
      content: [
        {
          columns: [
            // Company Logo
            {
              width: 'auto',
              stack: [
                {
                  image: this.userDetails?.app_meta_details?.billingdetails?.logo,
                  width: 100,
                  height: 100
                }
              ],
              alignment: 'left',
              margin: [0, 0, 20, 0]
            },
            // Invoice Title and Company Details
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
            // Customer Details
            [
              {
                text: this.invoice.customerName,
                bold: true,
                fontSize: 12,
                marginBottom: 5
              },
              { text: this.invoice.address, fontSize: 10, marginBottom: 5 },
              { text: this.invoice.email, fontSize: 10, marginBottom: 5 },
              { text: this.invoice.phone, fontSize: 10, marginBottom: 5 },
              { text: this.invoice.gstNo || '', fontSize: 10 }
            ],
            // Invoice Details
            [
              {
                text: `Invoice Number: ${this.invoice.billNo}`,
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
              },
              {
                text: `Due Date: ${new Date().toLocaleDateString()}`,
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
              ...this.invoice.products.map((p) => [p.name, p.price, p.qty, (p.price * p.qty).toFixed(2)]),
              [{ text: '', colSpan: 4, fillColor: '#ffffff' }], // Empty row
              [
                { text: 'Subtotal', colSpan: 3, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                { text: this.invoice.subTotal, alignment: 'right', fillColor: '#eaeaea' }
              ],
              [
                { text: 'GST', colSpan: 3, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                { text: this.invoice.cgst + '%', alignment: 'right', fillColor: '#eaeaea' }
              ],
              [
                { text: 'Total', colSpan: 3, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                { text: "Rs." + this.invoice.finalTotal, alignment: 'right', fillColor: '#eaeaea', color: '#CC5803' }
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
    console.log("open")
    const docDefinition: any = this.createPDFData();

    const fileContent = JSON.stringify(docDefinition); // Convert docDefinition to a string

    // Create a Blob from the file content
    const blob = new Blob([fileContent], { type: 'application/json' });

    // Create a File from the Blob
    const file = new File([blob], 'invoice.pdf', { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('schema', '');
    formData.append('dbName', this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '');
    formData.append('collectionName', 'invoices');
    formData.append('collectionData', JSON.stringify(this.invoice));
    formData.append('file', file);
    console.log(formData)
    this.isLoading = true;
    this.entityService.addNewInvoiceEntity(formData).subscribe(
      (res: any) => {
        this.isLoading = false;
        console.log(res)
        if (res.status == 200) {
          pdfMake.createPdf(docDefinition).open();
          this.navigationService.navigateWithoutLocationChange(['client/home']);
        }
      },
      (err) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err);
      }
    );
  }

  downloadFile(dbName: any, collectionName: any, entityId: any) {
    const fileURL = `/files/${dbName}/${collectionName}/${entityId}/download`;
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = 'invoice.pdf';
    link.click();
  };

  addProduct() {
    this.invoice.products.push(new Product());
  }

  checkDatas() {
    if (this.invoice.billNo && this.invoice.customerName && this.invoice.phone && this.invoice.products.length >= 1 && this.invoice.subTotal > 0 && this.invoice.finalTotal > 0) {
      return false
    }
    return true
  }

  onRemoveTerms(index: number) {
    this.termsList.splice(index, 1)
  }

  onProductRemove(index: number) {
    this.invoice.products.splice(index, 1);
  }

  onCalculateSubTotal() {
    let subtotal = 0
    this.invoice.products.forEach((item: any) => {
      subtotal = subtotal + (item.price * item.qty)
    })
    this.invoice.subTotal = subtotal;
    this.isSubTotalClicked = true;
    this.invoice.finalTotal = 0;
  }

  onCalculateTotal() {
    this.invoice.cgstAmount = (this.invoice.cgst * this.invoice.subTotal) / 100;
    // this.invoice.sgstAmount = (this.invoice.sgst * this.invoice.subTotal) / 100;
    // this.invoice.igstAmount = (this.invoice.igst * this.invoice.subTotal) / 100;
    this.invoice.finalTotal = this.invoice.subTotal + this.invoice.cgstAmount;
    console.log(this.invoice);
    this.isFinalTotalClicked = true;

  }

  getTax(taxname: any) {
    this.invoice.cgstAmount = (this.invoice.subTotal * this.invoice.cgst) / 100
  }

}

class Product {
  name: string;
  price: number;
  qty: number;
  constructor(name?: any, price?: any, qty?: any) {
    this.name = name;
    this.price = price;
    this.qty = qty;
  }
}
class Invoice {
  customerName: string;
  address: string;
  phone: number;
  email: string;
  billNo: number = 0;
  subTotal: number = 0;
  cgst: number = 0;
  cgstAmount: number = 0;
  sgst: number = 0;
  gstNo: string;
  sgstAmount: number = 0;
  igstAmount: number = 0;
  igst: number = 0;
  finalTotal: number = 0;
  products: Product[] = [];
  invoicedate: string = '';
  createdAt = new Date();
  additionalDetails: string;
  conditions: any = [];

  constructor(name?: any, place?: any, address?: any, email?: any, contact?: any, services?: any) {
    if (services) {
      this.customerName = name;
      this.email = email;
      this.address = place ? place : address;
      this.phone = contact;
      services.forEach((data: any) => {
        this.products.push(new Product(data.service_name, data.service_price, 1))
      })
    } else {
    }
  }
}




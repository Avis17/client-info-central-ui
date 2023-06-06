import { Component, OnDestroy } from '@angular/core';
import * as pdfMake  from 'pdfmake/build/pdfmake';
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
export class BillingComponent implements OnDestroy{

  userDetails:any;
  gstList = [2, 2.5, 3, 4,  5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];
  isSubTotalClicked = false;
  isFinalTotalClicked = false;
  invoicedetails :any;
  constructor(
    private authService: AuthGuardService,
    private entityService: EntityService,
    private navigationService:NavigationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
  ){
    this.userDetails = this.authService.getUserDetails();
    this.invoicedetails = entityService.getInvoiceDetails();
    if(this.invoicedetails){
      console.log(this.invoicedetails)
      if(this.invoicedetails){
        this.invoice = new Invoice(this.invoicedetails.name, this.invoicedetails.place, this.invoicedetails.email, this.invoicedetails.phone, this.invoicedetails.services)
      }else{
        this.invoice = new Invoice();
      }
    }
  }

  invoice = new Invoice();
  termsList :any = [
    {terms : "Order can be return in max 10 days."},
    {terms : "Warrenty of the product will be subject to the manufacturer terms and conditions."},
    {terms : "This is system generated invoice."}
  ]

  ngOnDestroy(): void {
    this.entityService.setinvoiceDetails({})
  }

  createPDFData(){
    return {
      content: [ 
        {
          text: 'INVOICE',
          fontSize: 20,
          bold: true,
          alignment: 'center',
          decoration: 'underline',
          color: '#1C4E80'
        },
        {
          text: 'Customer Details',
          style: 'sectionHeader'
        },
        {
          columns: [
            [
              {
                text: this.invoice.customerName,
                bold:true
              },
              { text: this.invoice.address },
              { text: this.invoice.email },
              { text: this.invoice.phone },
              { text: this.invoice.gstNo || '' }
            ],
            [
              {
                  text: this.userDetails?.app_meta_details?.company_name,
                  fontSize: 18,
                  color: '#1C4E80',
                  alignment : 'right',
                  decoration: 'underline'
              },
              {
                text: `Date: ${new Date().toLocaleString()}`,
                alignment: 'right'
              },
              { 
                text: `Bill No : ${this.invoice.billNo}`,
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: 'Order Details',
          style: 'sectionHeader'
        },
        {
          table: {
            headerRows: 1,
            heights: 30,
            alignment : 'center',
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              ['Product', 'Price', 'Quantity', 'Amount'],
              ...this.invoice.products.map((p:any) => [p.name, p.price, p.qty, (p.price*p.qty).toFixed(2)])
            ]
          }
        },
        {
          layout: {
            defaultBorder: false,
            hLineWidth: function(i:any, node:any) {
              return 1;
            },
            vLineWidth: function(i:any, node:any) {
              return 1;
            },
            hLineColor: function(i:any, node:any) {
              return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
          },
          vLineColor: function(i:any, node:any) {
              return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
          },
            hLineStyle: function(i:any, node:any) {
              // if (i === 0 || i === node.table.body.length) {
              return null;
              //}
            },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            paddingLeft: function(i:any, node:any) {
              return 10;
            },
            paddingRight: function(i:any, node:any) {
              return 10;
            },
            paddingTop: function(i:any, node:any) {
              return 3;
            },
            paddingBottom: function(i:any, node:any) {
              return 3;
            },
            fillColor: function(rowIndex:any, node:any, columnIndex:any) {
              return '#fff';
            },
          },
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['55%', '45.7%'],
            body: [
              [
                {
                  text: 'Payment Subtotal',
                  border: [true, true, true, true],
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
                {
                  border: [true, true, true, true],
                  text: this.invoice.subTotal,
                  alignment: 'right',
                  fillColor: '#f5f5f5',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                {
                  text: 'Tax SGST @ '+ this.invoice.sgst+'%',
                  border: [true, true, true, true],
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
                {
                  text: + this.invoice.sgstAmount,
                  border: [true, true, true, true],
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                {
                  text: 'Tax CGST @ '+ this.invoice.cgst+'%',
                  border: [true, true, true, true],
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
                {
                  text: this.invoice.cgstAmount,
                  border: [true, true, true, true],
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                {
                  text: 'Tax IGST @ ' + this.invoice.igst+'%',
                  border: [true, true, true, true],
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
                {
                  text: this.invoice.igstAmount,
                  border: [true, true, true, true],
                  fillColor: '#f5f5f5',
                  alignment: 'right',
                  margin: [0, 5, 0, 5],
                },
              ],
              [
                {
                  text: 'Total',
                  bold: true,
                  fontSize: 20,
                  alignment: 'right',
                  border: [true, true, true, true],
                  margin: [0, 5, 0, 5],
                },
                {
                  text: "Rs "+this.invoice.finalTotal,
                  bold: true,
                  fontSize: 20,
                  alignment: 'right',
                  border: [true, true, true, true],
                  fillColor: '#f5f5f5',
                  margin: [0, 5, 0, 5],
                },
              ],
            ],
          }
        },
        '\n\n',
        // {
        //   text: 'Additional Details',
        //   style: 'sectionHeader'
        // },
        // {
        //     text: this.invoice.additionalDetails,
        //     margin: [0, 0 ,0, 15]          
        // },
        {
          columns: [
            {
              stack:[
                {
                  width: 150,
                  alignment: "right",
                  image: this.userDetails?.app_meta_details?.billingdetails?.signature,
                  margin: [0, 60, 0, 3],
                },
                {
                  width: '100%',
                  text: 'For '+this.userDetails?.app_meta_details?.company_name?.toLowerCase(),
                  alignment: "right",
                  style: 'notesText',
                  margin: [0, 10, 20, 3],
                }
              ]
            }
          ],
        },
        {
          text: 'Terms and Conditions',
          style: 'sectionHeader'
        },
        {
            ul: [...this.termsList.map((data:any) => data.terms)],
        }
      ],
      styles: {
        sectionHeader: {
          bold: true,
          decoration: 'underline',
          fontSize: 14,
          margin: [10, 15, 0, 15]          
        },
        notesText: {
          fontSize: 10,
        },
      }
    };
  }

  generatePDF(action = 'open') {
    let docDefinition:any = this.createPDFData();
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "collectionData": {...this.invoice}
    }
    this.entityService.addNewEntity(formData).subscribe((res:any)=>{
        if (res.status == 200) {
          pdfMake.createPdf(docDefinition).open();      
          this.navigationService.navigateWithoutLocationChange(['client/home']);
        }
      }, (err) => {
        this.errorHandlingService.errorAlertMsg(err);
      })

    // if(action==='download'){
    //   pdfMake.createPdf(docDefinition).download();
    // }else if(action === 'print'){
    //   pdfMake.createPdf(docDefinition).print();      
    // }else{
    //   pdfMake.createPdf(docDefinition).open();      
    // }

  }

  addProduct(){
    this.invoice.products.push(new Product());
  }

  checkDatas(){
    if(this.invoice.billNo && this.invoice.customerName && this.invoice.phone && this.invoice.products.length >= 1 && this.invoice.subTotal > 0 && this.invoice.finalTotal > 0){
      return false
    }
    return true
  }

  onRemoveTerms(index:number){
    this.termsList.splice(index, 1)
  }

  onProductRemove(index:number){
    this.invoice.products.splice(index, 1);
  }

  onCalculateSubTotal()
  {
      let subtotal = 0
      this.invoice.products.forEach((item:any)=>{
        subtotal = subtotal + (item.price*item.qty)
      })
      this.invoice.subTotal = subtotal;
      this.isSubTotalClicked = true;
      this.invoice.finalTotal = 0;
  }

  onCalculateTotal()
  {
    this.invoice.cgstAmount = (this.invoice.cgst*this.invoice.subTotal)/100;
    this.invoice.sgstAmount = (this.invoice.sgst*this.invoice.subTotal)/100;
    this.invoice.igstAmount = (this.invoice.igst*this.invoice.subTotal)/100;
    this.invoice.finalTotal = this.invoice.subTotal + this.invoice.cgstAmount + this.invoice.sgstAmount + this.invoice.igstAmount;
    console.log(this.invoice);
    this.isFinalTotalClicked = true;
    
  }

  getTax(taxname:any){
    this.invoice.cgstAmount = (this.invoice.subTotal * this.invoice.cgst)/100
  }

}

class Product{
  name: string ;
  price: number;
  qty: number;
  constructor(name?:any, price?:any, qty?:any){
    this.name = name;
    this.price = price;
    this.qty = qty;
  }
}
class Invoice{
  customerName: string;
  address: string;
  phone: number;
  email: string;
  billNo : number = 0;
  subTotal : number = 0;
  cgst : number = 0;
  cgstAmount : number = 0;
  sgst : number = 0;
  gstNo : string;
  sgstAmount : number = 0;
  igstAmount : number = 0;
  igst : number = 0;
  finalTotal : number = 0;
  products: Product[] = [];
  invoicedate:string = '';
  createdAt = new Date(); 
  additionalDetails: string;
  conditions:any = [];

  constructor(name?:any, place?:any, email?:any, contact?:any, services?:any){
    // Initially one empty product row we will show
    if(services){
      this.customerName = name;
      this.email = email;
      this.address = place;
      this.phone = contact;
      services.forEach((data:any)=>{
        this.products.push(new Product(data.service_name, data.service_price, 1))
      })
    } else{
      // this.products.push(new Product());
    }
  }
}
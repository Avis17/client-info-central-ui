import { Component, OnDestroy } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AuthGuardService } from 'src/app/services/auth-guard.service';
import { EntityService } from '../../services/entity.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { CommonService } from 'src/app/services/common.service';
import { AppMetaCreationService } from 'src/app/modules/admin/services/app-meta-creation.service';
import Swal from 'sweetalert2';
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
  paymentStatus: string = '';
  partPaymentAmount: string = '';
  invoiceuser: any;
  servicesList: any = []

  constructor(
    private authService: AuthGuardService,
    private entityService: EntityService,
    private navigationService: NavigationService,
    private errorHandlingService: ErrorHandlingService,
    private commonService: CommonService,
    private appMetaService: AppMetaCreationService
  ) {
    // this.generatePDF_Format_2();
    this.userDetails = this.authService.getUserDetails();
    this.getBillNo({});
    this.termsList = [...this.userDetails.app_meta_details.terms] || [
      { terms: "Order can be return in max 10 days." },
      { terms: "Warrenty of the product will be subject to the manufacturer terms and conditions." },
      { terms: "This is system generated invoice." }
    ];
    this.servicesList = this.userDetails?.app_meta_details?.servicesList?.categories.map((data: any) => {
      data.items.forEach((item: any) => {
        item.categoryName = data.categoryName
      })
      return data.items
    }).reduce((initialValue: any, data: any) => {
      return initialValue = [...initialValue, ...data]
    }, [])
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
  termsList: any;
  isBillCreated: boolean = false;
  isInvlidPartAmount: boolean = false;
  billNo: Number = 1;
  currentBillNo: any;
  ngOnDestroy(): void {
    this.entityService.setinvoiceDetails({})
  }

  getTodaysDate(): string {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 to month since it is zero-based
    const day = date.getDate().toString().padStart(2, '0');
    return year + month + day;
  }


  onProductChange(event: any, index: number) {
    console.log(event)
    this.invoice.products[index].price = this.servicesList.find((data: any) => event.target.value == data.itemName)?.itemPrice;
  }

  createPDFData() {
    const upiId = this.userDetails?.app_meta_details?.billingdetails?.upiId || ''; // Replace with your actual UPI ID
    const paymentAmount = this.invoice.finalTotal; // Retrieve the payment amount from the invoice

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
            // Company Logo
            {
              width: 'auto',
              stack: logoStack,
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
                  decoration: 'underline',
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
          style: 'sectionHeader',
          color: '#CC5803', // Red color
        },
        {
          columns: [
            [
              {
                columns: [
                  {
                    width: 'auto',
                    text: this.invoice.customerName,
                    fontSize: 10,
                    alignment: 'center',
                    // margin: [0, 2, 0, 5] // Add a small margin at the top and right
                    // margin: [0, 0, 0, 5] // Add a small margin at the top and right

                  }
                ],
                marginBottom: 5
              },
              {
                columns: [
                  {
                    width: 'auto',
                    text: this.invoice.address,
                    fontSize: 10,
                    alignment: 'center',
                    // margin: [0, 2, 0, 5] // Add a small margin at the top and right
                    // margin: [0, 0, 0, 5] // Add a small margin at the top and right

                  }
                ],
                marginBottom: 5
              },
              {
                columns: [
                  {
                    width: 'auto',
                    text: this.invoice.email,
                    fontSize: 10,
                    alignment: 'center',
                    // margin: [0, 2, 0, 5] // Add a small margin at the top and right
                    // margin: [0, 0, 0, 5] // Add a small margin at the top and right

                  }
                ],
                marginBottom: 5
              },
              {
                columns: [
                  {
                    width: 'auto',
                    text: this.invoice.phone,
                    fontSize: 10,
                    alignment: 'center',
                    // margin: [0, 2, 0, 5] // Add a small margin at the top and right
                    // margin: [0, 0, 0, 5] // Add a small margin at the top and right

                  }
                ],
                marginBottom: 5
              },
              {
                columns: [
                  {
                    width: 'auto',
                    text: this.invoice.gstNo || '',
                    fontSize: 10,
                    alignment: 'center',
                    // margin: [0, 2, 0, 5] // Add a small margin at the top and right
                    // margin: [0, 0, 0, 5] // Add a small margin at the top and right

                  }
                ]
              }
            ],
            [
              {
                text: `Invoice Number: ${this.invoice.billNo}`,
                bold: true,
                fontSize: 12,
                color: '#CC5803', // Red color
                alignment: 'right'
              },
              {
                text: `Date: ${new Date().toLocaleDateString('en-GB')}`,
                bold: true,
                fontSize: 12,
                alignment: 'right'
              }
            ]
          ]
        },
        {
          text: 'Invoice Items',
          style: 'sectionHeader',
          color: '#CC5803', // Red color
        },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'S.No.', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Price', style: 'tableHeader' },
                { text: 'Quantity', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader' }
              ],
              ...this.invoice.products.map((p, index) => [
                index + 1, // S.No.
                p.name,
                p.price,
                p.qty,
                { text: "Rs." + (p.price * p.qty).toFixed(2) }
              ]),
              [{ text: '', colSpan: 5, fillColor: '#ffffff' }], // Empty row
              [
                { text: 'Subtotal', colSpan: 4, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                {},
                { text: "Rs." + this.invoice.subTotal.toFixed(2), alignment: 'right', fillColor: '#eaeaea' }
              ],
              [
                { text: 'GST', colSpan: 4, alignment: 'right', bold: true, fillColor: '#eaeaea' },
                {},
                {},
                {},
                { text: this.invoice.cgst + '%', alignment: 'right', fillColor: '#eaeaea' }
              ],
              [
                { text: 'Total', colSpan: 4, alignment: 'right', bold: true, fillColor: '#eaeaea', color: '#CC5803' },
                {},
                {},
                {},
                { text: "Rs." + this.invoice.finalTotal.toFixed(2), alignment: 'right', fillColor: '#eaeaea', color: '#CC5803' }
              ]
            ]
          },
          layout: {
            vLineWidth: function (i: any, node: any) { return 0; }, // Remove vertical borders
            hLineWidth: function (i: any, node: any) { return 0; }, // Remove horizontal borders
            paddingLeft: function (i: any, node: any) { return 8; }, // Add left padding to align text
            paddingRight: function (i: any, node: any) { return 8; }, // Add right padding to align text
            paddingTop: function (i: any, node: any) { return 8; },
            paddingBottom: function (i: any, node: any) { return 8; }
          },
          margin: [0, 10, 0, 20] // Add margin to increase spacing
        },
        {
          text: 'Terms & Conditions',
          style: 'sectionHeader',
          color: '#CC5803', // Red color

        },
        this.termsList.map((term: any, index: number) => {
          return {
            text: `${index + 1}. ${term.terms}`, // Add the serial number using the index
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
                { text: 'Authorized Signature', fontSize: 12, bold: true, color: '#CC5803' },
                // { text: 'Your Name', fontSize: 10 }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 20, 0, 0], // Add margin to increase spacing
          columnGap: 10 // Adjust the gap between columns if needed
        },
        { text: 'For Payment:-', margins: [0, 0, 0, 4], color: '#CC5803' },
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
          fontSize: 12
        },
        sectionHeader: {
          bold: true,
          fontSize: 12,
          decoration: 'underline',
          margin: [0, 10, 0, 5] // Add margin to increase spacing
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };
  }

  validateAmount() {
    if (Number(this.partPaymentAmount) > this.invoice.finalTotal) {
      this.isInvlidPartAmount = true;
      return;
    }
    this.isInvlidPartAmount = false;
  }

  onSavePaymentDetails() {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "collectionData": { ...this.invoice, paymentStatus: this.paymentStatus, paidAmount: this.paymentStatus == 'part' ? this.partPaymentAmount : this.invoice.finalTotal }
    }
    this.isLoading = true;
    let _id = this.invoiceuser._id || '';
    this.entityService.updateEntityById(_id, formData).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.status == 200) {
          this.isBillCreated = true
          this.navigationService.navigateWithoutLocationChange(['client/home']);
        }
      },
      (err) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err);
      }
    );
  }

  generatePDF(action = 'open') {
    const docDefinition: any = this.createPDFData();
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoices',
      "collectionData": { ...this.invoice, billedBy: this.userDetails.email }
    }
    this.isLoading = true;
    this.entityService.addNewEntity(formData).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.status == 200) {
          this.invoiceuser = res.data;
          this.isBillCreated = true;
          pdfMake.createPdf(docDefinition).open();
        }
      },
      (err) => {
        this.isLoading = false;
        this.errorHandlingService.errorAlertMsg(err);
      }
    );

    this.addBilNo({ billdetails: { no: this.currentBillNo } });
  }

  generatePDF_Format_2() {


    // Define the document definition for the invoice
    var documentDefinition: any = {
      content: [
        {
          columns: [
            // {
            //   image: 'path/to/company-logo.png',
            //   width: 100,
            //   height: 100,
            // },
            {
              text: 'Company Name',
              style: 'company-name',
              alignment: 'right',
            },
          ],
        },
        {
          text: 'Invoice No: 1452',
          style: 'invoice-details',
        },
        {
          text: 'Invoice Date: June 14, 2023',
          style: 'invoice-details',
        },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Company Details\n', style: 'details-header' },
                'Company Name\n',
                'Address Line 1\n',
                'Address Line 2\n',
                'City, State - Postal Code',
              ],
            },
            {
              width: '50%',
              text: [
                { text: 'Billing Customer Details\n', style: 'details-header' },
                { text: 'Customer Name\n', style: 'customer-details' },
                'Address Line 1\n',
                'Address Line 2\n',
                'City, State - Postal Code',
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 20],
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Description', style: 'table-header' },
                { text: 'HSN Code', style: 'table-header' },
                { text: 'Qty', style: 'table-header' },
                { text: 'Rate', style: 'table-header' },
                { text: 'Amount', style: 'table-header' },
              ],
              ['Item 1', '12345', '2', '10.00', '20.00'],
              ['Item 2', '67890', '1', '15.00', '15.00'],
            ],
          },
          layout: {
            fillColor: function (rowIndex: any, node: any, columnIndex: any) {
              return rowIndex === 0 ? '#f2f2f2' : null;
            },
          },
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            {
              width: '50%',
              alignment: 'right',
              text: [
                { text: 'Total: $35.00\n', style: 'total' },
                { text: 'SGST: $1.75\n', style: 'total' },
                { text: 'CGST: $1.75\n', style: 'total' },
                { text: 'Grand Total: $38.50', style: 'total' },
              ],
            },
            {
              width: '50%',
              alignment: 'right',
              text: [
                { text: 'GSTIN: XXXXXXXXX\n', style: 'gst-details' },
                { text: 'Place of Supply: XXXXXXX', style: 'gst-details' },
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 20],
        },
        {
          columns: [
            {
              width: '50%',
              text: [
                { text: 'Account Details\n', style: 'details-header' },
                'Bank Name: ABC Bank\n',
                'Account No: 1234567890\n',
                'IFSC Code: ABCD1234',
              ],
            },
            {
              width: '50%',
              text: [
                { text: 'Digital Signature\n', style: 'details-header' },
                // { image: 'path/to/digital-signature.png', width: 150 },
              ],
              alignment: 'right',
            },
          ],
          columnGap: 10,
        },
      ],
      styles: {
        'company-name': {
          fontSize: 18,
          bold: true,
          color: 'blue',
        },
        'invoice-details': {
          bold: true,
          margin: [0, 5],
        },
        'details-header': {
          bold: true,
          color: 'blue',
        },
        'customer-details': {
          bold: true,
        },
        'table-header': {
          bold: true,
          fillColor: '#f2f2f2',
        },
        total: {
          alignment: 'right',
        },
        'gst-details': {
          alignment: 'right',
        },
      },
    };

    // Generate the PDF and open it in a new tab
    pdfMake.createPdf(documentDefinition).open();

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

  onAddTerms() {
    this.termsList.push({ terms: "" })
  }

  onSaveTermsList() {
    let query = {
      _id: this.userDetails.app_meta_details._id,
      data: {
        ...this.userDetails.app_meta_details,
        terms: this.termsList
      }
    }
    delete query.data._id;
    delete query.data.__v;
    this.isLoading = true;
    this.appMetaService.updateAppMetaById(query).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        this.authService.setUserDetails(
          {
            ...this.userDetails,
            app_meta_details: res.data
          }
        )
        Swal.fire("Terms List Updated successfully!")
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onValidateTc() {
    let isTermsEmpty = false;
    this.termsList.forEach((data: any) => {
      if (data.terms.trim() == '') {
        isTermsEmpty = true;
        return; // exit the loop if an empty term is found
      }
    });
    return isTermsEmpty;
  }

  onProductRemove(index: number) {
    this.invoice.products.splice(index, 1);
  }

  onCalculateSubTotal() {
    let subtotal = 0
    this.invoice.products.forEach((item: any) => {
      subtotal = subtotal + (Number(item.price) * Number(item.qty))
    })
    this.invoice.subTotal = subtotal;
    this.isSubTotalClicked = true;
    this.invoice.finalTotal = 0;
  }

  onCalculateTotal() {
    this.invoice.cgstAmount = (Number(this.invoice.cgst) * Number(this.invoice.subTotal)) / 100;
    // this.invoice.sgstAmount = (this.invoice.sgst * this.invoice.subTotal) / 100;
    // this.invoice.igstAmount = (this.invoice.igst * this.invoice.subTotal) / 100;
    this.invoice.finalTotal = Number(this.invoice.subTotal) + this.invoice.cgstAmount;
    this.isFinalTotalClicked = true;

  }

  getTax(taxname: any) {
    this.invoice.cgstAmount = (this.invoice.subTotal * this.invoice.cgst) / 100
  }

  getBillNo(query: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoiceNo',
      "queryData": {}
    }
    this.isLoading = true;
    this.entityService.getAllEntities(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        if (res.data.length > 0) {
          this.currentBillNo = Number(res.data[0].billdetails.no) + 1
          this.invoice.billNo = this.getTodaysDate() + "-" + this.currentBillNo;
        } else {
          this.addBilNo({ billdetails: { no: 1 } })
        }
        console.log(res)
      }
    }, (err: any) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

  onLoadDefault() {
    this.termsList = [...this.userDetails.app_meta_details.terms] || [
      { terms: "Order can be return in max 10 days." },
      { terms: "Warrenty of the product will be subject to the manufacturer terms and conditions." },
      { terms: "This is system generated invoice." }
    ];
  }

  addBilNo(data: any) {
    const formData = {
      "schema": '',
      "dbName": this.commonService.toMongodbCase(this.userDetails?.app_meta_details?.application_name) || '',
      "collectionName": 'invoiceNo',
      "collectionData": data
    }
    this.isLoading = true;
    this.entityService.addNewEntity(formData).subscribe((res: any) => {
      this.isLoading = false;
      if (res.status == 200) {
        // Swal.fire()
      }
    }, (err) => {
      this.isLoading = false;
      this.errorHandlingService.errorAlertMsg(err);
    })
  }

}

class Product {
  name: string;
  price: number;
  qty: number;
  categoryName: string;

  constructor(name?: any, price?: any, category?: any, qty?: any) {
    this.name = name;
    this.price = price;
    this.categoryName = category,
      this.qty = qty;
  }
}
class Invoice {
  customerName: string;
  address: string;
  phone: number;
  email: string;
  billNo: string = '';
  subTotal: number = 0;
  cgst: number = 0;
  cgstAmount: number = 0;
  // sgst: number = 0;
  gstNo: string;
  // sgstAmount: number = 0;
  // igstAmount: number = 0;
  // igst: number = 0;
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
        this.products.push(new Product(data.itemName, data.itemPrice, data.categoryName, 1))
      })
    } else {
    }
  }
}




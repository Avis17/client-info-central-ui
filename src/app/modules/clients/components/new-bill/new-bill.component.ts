import { Component, ViewChild, ElementRef } from '@angular/core';
import { jsPDF } from "jspdf";
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// import 'jspdf-autotable';
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

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

  ngOnInit() {
    // this.generateInvoice3()
  }

  generateInvoice() {
    // Define customer details
    const customerDetails = {
      name: 'John Doe',
      address: '123 Main St, City, State',
      // Add more customer details as needed
    };
  
    // Define company details
    const companyDetails = {
      name: 'Your Company',
      address: '456 Business Ave, City, State',
      // logo: 'path/to/your/company/logo.png', // Replace with your company logo path
    };
  
    // Define invoice data
    const invoiceData = {
      products: [
        { name: 'Product 1', hsn: 'HSN123', price: 10, description: 'Product 1 description', quantity: 2 },
        { name: 'Product 2', hsn: 'HSN456', price: 20, description: 'Product 2 description', quantity: 3 },
        // Add more products as needed
      ],
      subTotal: 70, // Total of all product prices without tax
      tax: 10, // Tax amount
      finalAmount: 80, // Total amount with tax
    };
  
    // Create an array to hold all the content of the PDF
    const content: any[] = [];
  
    // Add customer and company details in the same row
    content.push({
      columns: [
        { width: '50%', text: `Customer Details:\nName: ${customerDetails.name}\nAddress: ${customerDetails.address}` },
        { width: '50%', text: `Company Details:\nName: ${companyDetails.name}\nAddress: ${companyDetails.address}` }
      ]
    });
    content.push('\n'); // Add a line break
  
    // Add invoice table
    const tableContent: any[] = [
      [
        { text: 'Product Name', style: 'tableHeader' },
        { text: 'HSN Code', style: 'tableHeader' },
        { text: 'Quantity', style: 'tableHeader' },
        { text: 'Price', style: 'tableHeader' },
        { text: 'Total', style: 'tableHeader' }
      ],
    ];
  
    invoiceData.products.forEach((product: any) => {
      const total = product.price * product.quantity;
      tableContent.push([
        product.name,
        product.hsn,
        product.quantity.toString(),
        product.price.toString(),
        total.toString(),
      ]);
    });
  
    // Add subtotal, tax, and final amount without table borders
    tableContent.push(
      [
        { text: 'Subtotal:', colSpan: 4, alignment: 'right', bold: true },
        {},
        {},
        {},
        { text: invoiceData.subTotal.toString(), alignment: 'right' }
      ],
      [
        { text: 'Tax:', colSpan: 4, alignment: 'right', bold: true },
        {},
        {},
        {},
        { text: invoiceData.tax.toString(), alignment: 'right' }
      ],
      [
        { text: 'Final Amount:', colSpan: 4, alignment: 'right', bold: true },
        {},
        {},
        {},
        { text: invoiceData.finalAmount.toString(), alignment: 'right' }
      ]
    );
  
    content.push({ text: 'Invoice Details:', style: 'header' });
    content.push({
      table: {
        widths: ['*', '*', '*', '*', '*'],
        body: tableContent,
      },
      layout: {
        fillColor: function (rowIndex: number) {
          return (rowIndex === 0) ? '#CCCCCC' : null; // Add background color to header row
        }
      }
    });
  
    // Create the document definition
    const docDefinition: any = {
      content: content,
      styles: {
        header: {
          bold: true,
          fontSize: 16,
          margin: [0, 0, 0, 10],
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          fillColor: '#EEEEEE',
        },
      },
    };
  
    // Generate the PDF
    pdfMake.createPdf(docDefinition).open();
  }
  

  generateInvoice2() {

    // Define customer details, company details, and product data
    const customer = {
      name: 'John Doe',
      address: '123 Main St, City, State, Country',
      email: 'john.doe@example.com',
      phone: '+1 123-456-7890'
    };

    const company = {
      name: 'Your Company Name',
      address: '456 Business Ave, City, State, Country',
      email: 'info@yourcompany.com',
      phone: '+1 987-654-3210',
      // logo: 'path/to/company-logo.png'
    };

    const products = [
      { name: 'Product 1', hsnCode: '123456', price: 10, description: 'Product 1 description', quantity: 2 },
      { name: 'Product 2', hsnCode: '789012', price: 15, description: 'Product 2 description', quantity: 3 },
      // Add more product items as needed
    ];

    // Calculate sub total, tax, and final amount
    const subTotal = products.reduce((total, product) => total + (product.price * product.quantity), 0);
    const taxPercentage = 10; // Assuming tax is 10% (you can adjust accordingly)
    const taxAmount = subTotal * (taxPercentage / 100);
    const finalAmount = subTotal + taxAmount;

    // Define the document definition using pdfmake
    const documentDefinition:any = {
      content: [
        { text: 'INVOICE', style: 'header' },
        { text: 'Customer Details', style: 'subheader' },
        `Name: ${customer.name}`,
        `Address: ${customer.address}`,
        `Email: ${customer.email}`,
        `Phone: ${customer.phone}`,
        { text: 'Company Details', style: 'subheader' },
        `Name: ${company.name}`,
        `Address: ${company.address}`,
        `Email: ${company.email}`,
        `Phone: ${company.phone}`,
        // { image: company.logo, width: 100, height: 100 },
        { text: 'Product Details', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Product Name', 'HSN Code', 'Price', 'Description', 'Total'],
              ...products.map(product => [product.name, product.hsnCode, product.price, product.description, product.price * product.quantity]),
            ],
          },
        },
        { text: 'Summary', style: 'subheader' },
        `Sub Total: ${subTotal}`,
        `Tax (${taxPercentage}%): ${taxAmount}`,
        `Final Amount (including tax): ${finalAmount}`,
        { text: 'Signature', style: 'subheader' },
        '____________________', // Placeholder for signature
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
      },
    };

    pdfMake.createPdf(documentDefinition).open();

  }

  generateInvoice3() {
    // Define customer details
    const customerDetails = {
      name: 'John Doe',
      address: '123 Main St, City, State',
      // Add more customer details as needed
    };
  
    // Define company details
    const companyDetails = {
      name: 'Your Company',
      address: '456 Business Ave, City, State',
      // logo: 'path/to/your/company/logo.png', // Replace with your company logo path
    };
  
    // Define invoice data
    const invoiceData = {
      invoiceTitle: 'Invoice',
      invoiceNumber: 'INV-001',
      invoiceDate: 'June 20, 2023',
      products: [
        { name: 'Product 1', hsn: 'HSN123', price: 10, description: 'Product 1 description', quantity: 2 },
        { name: 'Product 2', hsn: 'HSN456', price: 20, description: 'Product 2 description', quantity: 3 },
        // Add more products as needed
      ],
      subTotal: 70, // Total of all product prices without tax
      tax: 10, // Tax amount
      finalAmount: 80, // Total amount with tax
      termsAndConditions: 'Terms and conditions: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    };
  
    // Create an array to hold all the content of the PDF
    const content: any[] = [];
  
    // Add invoice title, invoice number, and invoice date
    content.push({ text: invoiceData.invoiceTitle, style: 'invoiceTitle' });
    content.push({ text: `Invoice No: ${invoiceData.invoiceNumber}`, alignment: 'right' });
    content.push({ text: `Invoice Date: ${invoiceData.invoiceDate}`, alignment: 'right' });
    content.push('\n'); // Add a line break
  
    // Add border box for customer details and company details with logo
    content.push({
      columns: [
        {
          width: '40%',
          text: [
            { text: 'Customer Details:\n', style: 'sectionHeader' },
            { text: `Name: ${customerDetails.name}\nAddress: ${customerDetails.address}`, style: 'sectionContent' }
          ]
        },
        {
          width: '20%',
          stack: [
            // { image: 'path/to/your/company/logo.png', width: 100, alignment: 'center' }, // Replace with your company logo path
            // { qr: 'https://example.com/qr-code', fit: 50, alignment: 'center' } // Replace with your QR code value
          ]
        },
        {
          width: '40%',
          text: [
            { text: 'Company Details:\n', style: 'sectionHeader' },
            { text: `Name: ${companyDetails.name}\nAddress: ${companyDetails.address}`, style: 'sectionContent' }
          ]
        }
      ],
      margin: [0, 0, 0, 10], // Add margin to separate from the next section
      style: 'borderBox'
    });
    content.push('\n'); // Add a line break
  
    // Add invoice table
    const tableContent: any[] = [
      [
        { text: 'Product Name', style: 'tableHeader' },
        { text: 'HSN Code', style: 'tableHeader' },
        { text: 'Quantity', style: 'tableHeader' },
        { text: 'Price', style: 'tableHeader' },
        { text: 'Total', style: 'tableHeader' }
      ],
    ];
  
    invoiceData.products.forEach((product: any) => {
      const total = product.price * product.quantity;
      tableContent.push([
        product.name,
        product.hsn,
        product.quantity.toString(),
        product.price.toString(),
        total.toString(),
      ]);
    });
  
    // Add subtotal, tax, and final amount without table borders
    tableContent.push(
      [
        { text: 'Subtotal:', colSpan: 4, alignment: 'right', bold: true },
        {},
        {},
        {},
        { text: invoiceData.subTotal.toString(), alignment: 'right' }
      ],
      [
        { text: 'Tax:', colSpan: 4, alignment: 'right', bold: true },
        {},
        {},
        {},
        { text: invoiceData.tax.toString(), alignment: 'right' }
      ],
      [
        { text: 'Final Amount:', colSpan: 4, alignment: 'right', bold: true },
        {},
        {},
        {},
        { text: invoiceData.finalAmount.toString(), alignment: 'right' }
      ]
    );
  
    content.push({ text: 'Invoice Details:', style: 'header' });
    content.push({
      table: {
        widths: ['*', '*', '*', '*', '*'],
        body: tableContent,
      },
      layout: {
        fillColor: function (rowIndex: number) {
          return (rowIndex === 0) ? '#1C4E80' : null; // Add background color to header row
        }
      },
      style: 'table'
    });
  
    // Add terms and conditions
    content.push('\n'); // Add a line break
    content.push({
      text: 'Terms and Conditions:',
      style: 'header',
      margin: [0, 10, 0, 5] // Add margin to separate from the previous section
    });
    content.push({ text: invoiceData.termsAndConditions });
  
    // Create the document definition
    const docDefinition: any = {
      content: content,
      styles: {
        invoiceTitle: {
          fontSize: 20,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10],
          color: '#1C4E80'
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 5],
          color: '#1C4E80'
        },
        sectionContent: {
          fontSize: 12,
          margin: [0, 0, 0, 5]
        },
        borderBox: {
          border: '1px solid #1C4E80',
          padding: [5, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          fillColor: '#1C4E80',
          color: '#FFFFFF'
        },
        header: {
          bold: true,
          fontSize: 16,
          margin: [0, 10, 0, 5],
          color: '#1C4E80'
        },
        table: {
          margin: [0, 10, 0, 10]
        }
      },
    };
  
    // Generate the PDF
    pdfMake.createPdf(docDefinition).open();
  }
  

}

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  isResetSent : boolean = false;
  constructor(private http: HttpClient) { }

  onSubmit() {
    const data = { email: this.email };

    this.http.post('http://localhost:2000/forgot-password', data).subscribe(
      (response) => {
        console.log(response);
        this.isResetSent = true;
      },
      (error) => {
        this.isResetSent = false;
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          text: 'Try again with valid email ID!',
        })
        // Show an error message to the user
      }
    );
  }

  validate(){
    if(this.email == '' || !this.email.includes('@') || !this.email.includes('.')){
      return true
    }else{
      return false
    }
  }
}

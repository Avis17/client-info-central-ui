import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  newPassword: string;
  confirmPassword: string;
  token: any;

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    if (this.newPassword !== this.confirmPassword) {
      // Show an error message that passwords don't match
      return;
    }

    const data = {
      token: this.token,
      password: this.newPassword
    };

    this.http.post('http://localhost:2000/reset-password', data).subscribe(
      (response) => {
        console.log(response);
        // Show a success message to the user
      },
      (error) => {
        console.error(error);
        // Show an error message to the user
      }
    );
  }

}

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  userDetails: any = {
    authorizeTo: ''
  };

  URL = environment.apiUrl;
  constructor(private router: Router, private http: HttpClient, private cookieService: CookieService) { }


  getSessionUserDetails() {
    let user = sessionStorage.getItem("user");
    if (user) {
      user = JSON.parse(user)
    }
    return user ? user : false;
  }

  setSessionUserDetails(data: any) {
    sessionStorage.setItem("user", JSON.stringify(data));
  }

  canActivate(): boolean {
    const isAuthenticated = this.getSessionUserDetails();
    if (!isAuthenticated) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  setUserDetails(details: any) {
    this.userDetails = details
  }
  getUserDetails() {
    return this.userDetails
  }

  clearUserDetails() {
    this.userDetails = {}
  }


  login(user: any) {
    return this.http.post(this.URL + "login", user);
  }

  register(user: any) {
    return this.http.post(this.URL + "app/cic/users/v1/signin", user);
  }

  getToken(): string {
    return this.cookieService.get('token');
  }

  setToken(token: string): void {
    // this.cookieService.set('token', token);
    const tokenExpirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    const expirationDate = new Date(Date.now() + tokenExpirationTime);
    this.cookieService.set('token', token, { expires: expirationDate });

  }

  removeToken(): void {
    this.cookieService.delete('token');
  }

  clearSession() {
    sessionStorage.clear()
  }

  logout() {
    this.http.post(this.URL + "logout", { email: this.userDetails.email }).subscribe((res: any) => {
      if (res) {
        this.clearSession()
        this.removeToken();
        this.clearUserDetails();
        this.router.navigate(["/"])
      }
    }, (err: any) => {
      this.clearSession()
      this.removeToken();
      this.clearUserDetails();
      this.router.navigate(["/"])
    })
  }

  logoutWithoutNavigate() {
    this.clearSession()
    this.removeToken();
    this.clearUserDetails();
  }

  canAdminActivate() {
    // console.log(this.userDetails)
    if (this.userDetails.authorizeTo == 'admin' || this.userDetails.authorizeTo == 'developer') {
      return true
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
  canClientActivate() {
    // console.log(this.userDetails)
    if (this.userDetails.authorizeTo == 'client') {
      return true
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}

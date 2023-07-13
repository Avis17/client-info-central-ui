import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environment/environment';
import Swal from 'sweetalert2';
import { CryptoService } from './crypto.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  userDetails: any = {
    authorizeTo: ''
  };

  URL = environment.apiUrl;
  constructor(
    private router: Router, 
    private http: HttpClient, 
    private toastr: ToastrService,
    private cookieService: CookieService,
    private cryptService:CryptoService,
    ) { }

  getUserPermission(){
    return this.userDetails.permission;
  }

  getSessionUserDetails() {
    let user = localStorage.getItem("user");
    if (user) {
      user = JSON.parse(user)
    }
    return user ? user : false;
  }

  setSessionUserDetails(data: any) {
    localStorage.setItem("user", JSON.stringify(data));
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
    this.setSessionUserDetails(this.cryptService.encrypt(JSON.stringify(details)));
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
    this.cookieService.set('token', token);
  }

  removeToken(): void {
    this.cookieService.delete('token');
  }

  clearSession() {
    localStorage.clear()
  }

  logout(email?:string) {
    this.http.post(this.URL + "logout", { email: this.userDetails.email || email }).subscribe((res: any) => {
      if (res) {
        this.toastr.success('Access to your account has been terminated. Please login again to regain access.', 'Notification');
        this.clearSession()
        this.removeToken();
        this.clearUserDetails();
        this.router.navigate(["/"])
      }
    }, (err: any) => {
      if(err.status == 404){
        this.toastr.warning('You are not currently logged in. Please log in to continue.', 'Notification');
      }
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

  logoutWithoutAPI() {
    this.clearSession()
    this.removeToken();
    this.clearUserDetails();
    this.router.navigate(["/"])
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

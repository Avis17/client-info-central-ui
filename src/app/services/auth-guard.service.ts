import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  userDetails : any = {
    authorizeTo : ''
  };

  URL = environment.apiUrl;
  constructor(private router: Router, private http:HttpClient, private cookieService: CookieService) { }


  getSessionUserDetails(){
    let user = sessionStorage.getItem("user");
    if(user){
      user = JSON.parse(user)
    }
    return user ? user : false;
  }

  setSessionUserDetails(data:any){
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

  setUserDetails(details:any){
    this.userDetails = details
  }
  getUserDetails(){
    return this.userDetails
  }

  clearUserDetails(){
    this.userDetails = {}
  }


  login(user:any){
    return this.http.post(this.URL+"login", user);
  }

  register(user:any){
    return this.http.post(this.URL+"app/cic/users/v1/signin", user);
  }

  getToken(): string {
    return this.cookieService.get('token');
  }

  setToken(token: string): void {
    this.cookieService.set('token', token, { expires: 40 / (24 * 60) }); // Set expiration to 20  minutes (20 minutes / (24 hours * 60 minutes))
  }

  removeToken(): void {
    this.cookieService.delete('token');
  }

  clearSession(){
    sessionStorage.clear()
  }

  logout(){
    this.clearSession()
    this.removeToken();
    this.clearUserDetails();
    this.router.navigate(["/"])
  }

  logoutWithoutNavigate(){
    this.clearSession()
    this.removeToken();
    this.clearUserDetails();
  }

  canAdminActivate(){
    // console.log(this.userDetails)
    if(this.userDetails.authorizeTo == 'admin' || this.userDetails.authorizeTo == 'developer'){
      return true
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
  canClientActivate(){
    // console.log(this.userDetails)
    if(this.userDetails.authorizeTo == 'client'){
      return true
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}

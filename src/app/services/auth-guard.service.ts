import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  userDetails : any;
  URL = "http://localhost:2000/"
  constructor(private router: Router, private http:HttpClient) { }


  getSeesionUserDetails(){
    let user = sessionStorage.getItem("user");
    if(user){
      user = JSON.parse(user)
    }

    return user ? user : false;
  }

  canActivate(): boolean {
    const isAuthenticated = this.getSeesionUserDetails();
    if (!isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  setUserDetails(details:any){
    this.userDetails = details
  }

  getUserDetails(){
    return this.userDetails;
  }

  login(user:any){
    return this.http.post(this.URL+"login", user);
  }

  register(user:any){
    return this.http.post(this.URL+"signin", user);
  }
}

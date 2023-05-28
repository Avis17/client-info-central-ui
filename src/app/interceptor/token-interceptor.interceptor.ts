import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthGuardService } from '../services/auth-guard.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptorInterceptor implements HttpInterceptor {
  constructor(private authService:AuthGuardService, private router:Router) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          authorization: token
        } 
      });
    }
    return next.handle(request);
  }
}

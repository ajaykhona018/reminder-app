import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Hosting } from './hosting';
import { Router } from '@angular/router';

declare var bcrypt: any;
@Injectable()
export class AuthService {

  // private _loginURL: string = 'http://localhost:3000/api/login';
  private _tokenKey: string = 'rat';
  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(Hosting.getUrl('/api/login'), { email: email, password: password });
  }

  logout() {
    window.sessionStorage.removeItem(this._tokenKey);
    this.router.navigate(['login']);
  }

  setToken(token: string) {
    window.sessionStorage.setItem(this._tokenKey, token);
  }

  getToken() {
    return window.sessionStorage.getItem(this._tokenKey);
  }

  isLoggedIn() {
    if (!window.sessionStorage.getItem(this._tokenKey)) {
      return false;
    } else {
      return true;
    }
  }
}

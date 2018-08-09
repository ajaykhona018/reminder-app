import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Hosting } from '../hosting';

@Injectable()
export class AccountsService {

  constructor(private _http: HttpClient) { }

  addAccount(account) {
    return this._http.post(Hosting.getUrl('/api/accounts/add'), account);
  }
  getAccounts() {
    return this._http.get(Hosting.getUrl('/api/accounts'));
  }
}

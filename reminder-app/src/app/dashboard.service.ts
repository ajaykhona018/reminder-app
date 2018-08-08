import { Injectable, Host } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Hosting } from './hosting';
@Injectable()
export class DashboardService {


  constructor(private _http: HttpClient) {

  }

  getDashboardData() {
    return this._http.get(Hosting.getUrl('/api/dashboard-data'));
  }

}

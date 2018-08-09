import { Component, OnInit } from '@angular/core';
import { AccountsService } from './accounts.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {
  searchResult = [];

  constructor(private accountsService: AccountsService) { }

  ngOnInit() {
    this.accountsService.getAccounts().subscribe((response: Response) => {
      // console.log(response);
      this.searchResult = response.data;
    });
  }

}
interface Response {
  success: boolean;
  data?: Array<any>;
  msg?: string;
}
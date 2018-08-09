import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-displayaccounts',
  templateUrl: './displayaccounts.component.html',
  styleUrls: ['./displayaccounts.component.scss']
})
export class DisplayaccountsComponent implements OnInit {
  @Input() accounts: Array<any>;
  selectCount: number = 0;
  constructor() { }

  ngOnInit() {
  }

  toggleSelectAccount($event) {
    if ($event.target.checked) {
      this.selectCount++;
    } else {
      this.selectCount--;
    }
  }

  toggleSelectAllAccounts($event) {
    if ($event.target.checked) {
      this.selectCount = this.accounts.length;
    } else {
      this.selectCount = 0;
    }
    this.accounts.forEach((account) => {
      account.selected = !!$event.target.checked
    });
  }
}

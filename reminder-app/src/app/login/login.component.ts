import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginUserData = {
    email: "", password: ""
  };

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['landing']);
    }
  }
  btnLogin() {
    console.log(this.loginUserData);
    this.auth.login(this.loginUserData.email, this.loginUserData.password).subscribe((res) => {
      this.auth.setToken(res.token);
      this.router.navigate(['landing']);
      // console.log(res.token);

      // console.log(res);
    }, (error) => {
      console.log(error.error);
    });
  }

}

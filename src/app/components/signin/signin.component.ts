import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.less']
})
export class SignInComponent implements OnInit {

  tokenObserver = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.registerOnUserChange();
  }

  onSignInClick() {
    this.userService.signIn().catch((reason: any) => { });
  }

  registerOnUserChange() {
    this.tokenObserver = this.userService.getToken().subscribe((token: string) => {
      if (token != null) {
        this.router.navigate(['/home']);

        if (this.tokenObserver != null) {
          this.tokenObserver.unsubscribe();
        }
      }
    });
  }
}

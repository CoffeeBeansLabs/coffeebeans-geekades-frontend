import { Injectable, HostListener } from '@angular/core';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../constants';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private tokenSubject = new BehaviorSubject<string>(null);

  constructor(private authService: SocialAuthService, private apiService: ApiService) {
    const token = this.getTokenFromStorage();

    if (token != null) {
      this.tokenSubject.next(token);
    }

    this.authService.authState.subscribe((user: SocialUser) => {
      if (user != null) {
        this.apiService.login(user.idToken).subscribe((response: ApiResponse) => {
          if (response.success) {
            this.setUserToken(response.data.token);
          }
        });
      } else {
        this.deleteToken();
      }
    });
  }

  signIn() {
    return this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  getToken() {
    return this.tokenSubject.asObservable();
  }

  getUser() {
    return this.authService.authState;
  }

  logout() {
    this.authService.signOut(true);
    this.deleteToken();
  }

  private getTokenFromStorage(): string {
    return localStorage.getItem('user_token');
  }

  private setUserToken(token: any) {
    localStorage.setItem('user_token', token);
    this.apiService.headerDict.Authorization = token;
    this.tokenSubject.next(token);
  }

  private deleteToken() {
    localStorage.removeItem('user_token');
    this.tokenSubject.next(null);
  }
}

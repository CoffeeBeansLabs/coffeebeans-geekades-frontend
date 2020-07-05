import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_ADDRESS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  URL = BACKEND_ADDRESS;

  headerDict = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: ''
  };

  constructor(private http: HttpClient) {
  }

  login(idToken: string) {
    console.log(idToken);
    return this.postReq('login', {
      token: idToken
    });
  }

  logout() {
    return this.postReq('logout', {});
  }

  submit(answer: string) {
    return this.postReq('submit', { name: answer });
  }

  private postReq(url: string, param: object) {
    return this.http.post(`${this.URL}/${url}`, param,
      { headers: this.headerDict }
    );
  }
}

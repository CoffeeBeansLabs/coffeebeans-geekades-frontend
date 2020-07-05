import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private injector: Injector) { }

  handleError(error: Error | HttpErrorResponse) {
    const notifier = this.injector.get(NotificationService);

    let errorMessage = '';
    let message = '';

    if (error instanceof HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // client-side error
        errorMessage = `Global client error\nError: ${error.error.message}`;
        message = error.error.message;
      } else {
        // server-side error
        errorMessage = `Global server error\nError Code: ${error.status}
          \nMessage: ${error.message}\nServer Message: ${error.error.message}`;
        if (error.status === 0) {
          message = 'No connection';
        } else {
          message = error.error.message || error.message;
        }
      }
    } else {
      // Client Error
      errorMessage = `Global Client side error\nError Code: ${(error.message) ? error.message : error.toString()}`;
      message = 'Server error';
    }

    notifier.showError(message);
  }
}

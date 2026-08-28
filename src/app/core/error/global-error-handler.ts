import { ErrorHandler, inject, Injectable } from '@angular/core';
import { toAppError } from '../http/http-error.mapper';
import { appErrorMessage } from '../models/app-error';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationService);

  handleError(error: unknown): void {
    console.error(error);
    this.notifications.error(appErrorMessage(toAppError(error)));
  }
}

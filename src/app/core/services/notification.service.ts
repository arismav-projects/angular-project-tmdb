import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/// Central wrapper for user-facing snack-bar messages.
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.show(message, 4000);
  }

  error(message: string): void {
    this.show(message, undefined);
  }

  private show(message: string, duration: number | undefined): void {
    this.snackBar.open(message, 'Dismiss', {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}

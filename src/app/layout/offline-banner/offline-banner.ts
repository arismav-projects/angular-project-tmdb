import { ConnectivityService } from '@core/services/connectivity.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/// Non-blocking because saved collections still work offline.
@Component({
  selector: 'app-offline-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (!isOnline()) {
      <p class="offline-banner__text">
        <mat-icon>cloud_off</mat-icon>
        You are offline. Saved collections still work; search needs a connection.
      </p>
    }
  `,
  styleUrl: './offline-banner.scss',
})
export class OfflineBanner {
  protected readonly isOnline = inject(ConnectivityService).isOnline;
}

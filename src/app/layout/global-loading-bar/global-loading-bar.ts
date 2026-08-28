import { LoadingService } from '@core/services/loading.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-global-loading-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressBarModule],
  template: `
    @if (isLoading()) {
      <mat-progress-bar mode="indeterminate" aria-label="Loading" />
    }
  `,
  styleUrl: './global-loading-bar.scss',
})
export class GlobalLoadingBar {
  protected readonly isLoading = inject(LoadingService).isLoading;
}

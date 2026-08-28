import { ThemeService } from '@core/services/theme.service';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconButton, MatIconModule, MatTooltipModule],
  template: `
    <button
      matIconButton
      type="button"
      [attr.aria-label]="label()"
      [matTooltip]="label()"
      (click)="toggle()"
    >
      <mat-icon>{{ icon() }}</mat-icon>
    </button>
  `,
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
  private readonly theme = inject(ThemeService);

  protected readonly icon = computed(() => (this.theme.isDark() ? 'light_mode' : 'dark_mode'));

  protected readonly label = computed(() =>
    this.theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme',
  );

  protected toggle(): void {
    this.theme.toggle();
  }
}

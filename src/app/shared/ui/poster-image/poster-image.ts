import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-poster-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, MatIconModule],
  template: `
    @if (path(); as posterPath) {
      <img [ngSrc]="posterPath" [alt]="alt()" [sizes]="sizes()" [priority]="priority()" fill />
    } @else {
      <span class="poster-image__fallback">
        <mat-icon>movie</mat-icon>
      </span>
    }
  `,
  styleUrl: './poster-image.scss',
})
export class PosterImage {
  /// TMDB path, or null when the film has no artwork.
  readonly path = input.required<string | null>();
  readonly alt = input.required<string>();
  readonly sizes = input('(min-width: 1200px) 17vw, (min-width: 600px) 25vw, 45vw');
  readonly priority = input(false);
}

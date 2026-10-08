import { Component, Input } from '@angular/core';
import { Review } from '../../../core/models/review.model';
import { fechaRelativa } from '../../../core/utils/dates';
import { StarRating } from '../star-rating/star-rating';

@Component({
  selector: 'app-review-card',
  imports: [StarRating],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css',
})
export class ReviewCard {
  @Input({ required: true }) resena!: Review;

  /** Iniciales del nombre para el avatar: "Laura Gómez" → "LG". */
  protected get iniciales(): string {
    return this.resena.usuario
      .split(/\s+/)
      .filter((palabra) => palabra !== '')
      .slice(0, 2)
      .map((palabra) => palabra[0].toUpperCase())
      .join('');
  }

  protected get cuando(): string {
    return fechaRelativa(this.resena.fecha);
  }
}

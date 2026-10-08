import { Component, Input } from '@angular/core';

/** Muestra de 0 a 5 estrellas llenas según la calificación (redondeada al entero más cercano). */
@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.css',
})
export class StarRating {
  @Input({ required: true }) valor = 0;
  /** Tamaño de cada estrella en píxeles. */
  @Input() tamano = 14;

  protected readonly posiciones = [1, 2, 3, 4, 5];

  protected get llenas(): number {
    return Math.min(5, Math.max(0, Math.round(this.valor)));
  }
}

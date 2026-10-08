import { Component, EventEmitter, Input, Output } from '@angular/core';

const ETIQUETAS = ['', 'Muy malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

/** Selector de calificación de 1 a 5 estrellas. Componente "tonto": muestra el valor y avisa cuando cambia. */
@Component({
  selector: 'app-rating-input',
  templateUrl: './rating-input.html',
  styleUrl: './rating-input.css',
})
export class RatingInput {
  /** 0 significa "todavía no eligió". */
  @Input() valor = 0;
  @Output() valorChange = new EventEmitter<number>();

  protected readonly posiciones = [1, 2, 3, 4, 5];

  protected get texto(): string {
    return this.valor === 0 ? 'Selecciona una calificación' : `${this.valor} de 5 (${ETIQUETAS[this.valor]})`;
  }

  protected elegir(n: number): void {
    this.valorChange.emit(n);
  }
}

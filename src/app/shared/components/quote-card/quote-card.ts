import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Accommodation } from '../../../core/models/accommodation.model';
import { Quote } from '../../../core/models/quote.model';
import { hoyISO } from '../../../core/utils/dates';
import { formatearPesos } from '../../../core/utils/formato';
import { QuoteErrors, QuoteInput } from '../../../core/validators/quote-validators';
import { QuoteSummary } from '../quote-summary/quote-summary';
import { StarRating } from '../star-rating/star-rating';

/**
 * Tarjeta de cotización. Componente "tonto": recoge fechas y huéspedes, y avisa con eventos.
 * Quien valida, calcula y decide qué mostrar es la página.
 */
@Component({
  selector: 'app-quote-card',
  imports: [DecimalPipe, ReactiveFormsModule, QuoteSummary, StarRating],
  templateUrl: './quote-card.html',
  styleUrl: './quote-card.css',
})
export class QuoteCard {
  @Input({ required: true }) alojamiento!: Accommodation;
  @Input() cotizacion: Quote | null = null;
  @Input() errores: QuoteErrors = {};
  /** true cuando el formulario de contacto ya está abierto: se oculta el botón Reservar. */
  @Input() reservando = false;

  @Output() calcular = new EventEmitter<QuoteInput>();
  /** Se emite cada vez que el usuario cambia algo: la cotización anterior deja de valer. */
  @Output() cambio = new EventEmitter<void>();
  @Output() reservar = new EventEmitter<void>();

  /** Las fechas anteriores a hoy no se pueden elegir (la regla también se valida en código). */
  protected readonly hoy = hoyISO();

  protected readonly formulario = new FormGroup({
    llegada: new FormControl('', { nonNullable: true }),
    salida: new FormControl('', { nonNullable: true }),
    huespedes: new FormControl(1, { nonNullable: true }),
  });

  protected get precio(): string {
    return formatearPesos(this.alojamiento.precioNoche);
  }

  protected get huespedes(): number {
    return this.formulario.controls.huespedes.value;
  }

  protected get puedeQuitar(): boolean {
    return this.huespedes > 1;
  }

  protected get puedeAgregar(): boolean {
    return this.huespedes < this.alojamiento.capacidad;
  }

  protected cambiarHuespedes(diferencia: number): void {
    const nuevo = this.huespedes + diferencia;
    if (nuevo < 1 || nuevo > this.alojamiento.capacidad) {
      return; // prevención de errores: no se puede salir de los límites
    }
    this.formulario.controls.huespedes.setValue(nuevo);
    this.alCambiar();
  }

  protected alCambiar(): void {
    this.cambio.emit();
  }

  protected enviar(): void {
    this.calcular.emit(this.formulario.getRawValue());
  }
}

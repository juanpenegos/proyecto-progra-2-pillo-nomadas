import { Component, Input } from '@angular/core';
import { Booking } from '../../../core/models/booking.model';
import { formatearFecha } from '../../../core/utils/dates';
import { formatearPesos } from '../../../core/utils/formato';
import { ImageWithFallback } from '../image-with-fallback/image-with-fallback';

/** Una reserva de "Mis reservas". Componente "tonto": solo muestra la reserva recibida. */
@Component({
  selector: 'app-booking-card',
  imports: [ImageWithFallback],
  templateUrl: './booking-card.html',
  styleUrl: './booking-card.css',
})
export class BookingCard {
  @Input({ required: true }) reserva!: Booking;

  protected pesos(valor: number): string {
    return formatearPesos(valor);
  }

  protected fecha(valor: string): string {
    return formatearFecha(valor);
  }

  protected get noches(): string {
    const n = this.reserva.noches;
    return n === 1 ? '1 noche' : `${n} noches`;
  }

  protected get personas(): string {
    const n = this.reserva.huespedes;
    return n === 1 ? '1 persona' : `${n} personas`;
  }
}

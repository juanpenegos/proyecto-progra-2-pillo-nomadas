import { Injectable, signal } from '@angular/core';
import { Accommodation } from '../models/accommodation.model';
import { Booking } from '../models/booking.model';
import { Quote } from '../models/quote.model';
import { correoValido, nombreValido } from '../validators/quote-validators';

/** Guarda las reservas en memoria: se pierden al recargar la página (lo permite el enunciado). */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly _reservas = signal<Booking[]>([]);

  /** Lista de solo lectura, la reserva más reciente primero. */
  readonly reservas = this._reservas.asReadonly();

  /**
   * Crea una reserva CONFIRMADA. Exige una cotización (la reserva solo existe después de cotizar)
   * y datos de contacto válidos.
   */
  crear(alojamiento: Accommodation, cotizacion: Quote, nombreHuesped: string, correo: string): Booking {
    if (cotizacion.noches < 1 || cotizacion.total <= 0) {
      throw new Error('No se puede reservar sin una cotización válida.');
    }
    if (!nombreValido(nombreHuesped) || !correoValido(correo)) {
      throw new Error('Los datos de contacto no son válidos.');
    }

    const reserva: Booking = {
      id: this.generarId(),
      alojamientoId: alojamiento.id,
      alojamientoNombre: alojamiento.nombre,
      ciudad: alojamiento.ciudad,
      imagenPrincipal: alojamiento.imagenPrincipal,
      llegada: cotizacion.llegada,
      salida: cotizacion.salida,
      huespedes: cotizacion.huespedes,
      noches: cotizacion.noches,
      subtotal: cotizacion.subtotal,
      tarifaLimpieza: cotizacion.tarifaLimpieza,
      tarifaServicio: cotizacion.tarifaServicio,
      total: cotizacion.total,
      nombreHuesped: nombreHuesped.trim(),
      correo: correo.trim(),
      estado: 'CONFIRMADA',
    };
    this._reservas.update((lista) => [reserva, ...lista]); // copia nueva, sin mutar la anterior
    return reserva;
  }

  obtener(id: string): Booking | undefined {
    return this._reservas().find((r) => r.id === id);
  }

  /** RES-<marca de tiempo>; si dos reservas caen en el mismo milisegundo, se avanza uno. */
  private generarId(): string {
    let marca = Date.now();
    while (this.obtener(`RES-${marca}`)) {
      marca++;
    }
    return `RES-${marca}`;
  }
}

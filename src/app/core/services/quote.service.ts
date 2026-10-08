import { Injectable } from '@angular/core';
import { Accommodation } from '../models/accommodation.model';
import { Quote } from '../models/quote.model';
import {
  QuoteErrors,
  QuoteInput,
  validarFechas,
  validarHuespedes,
  validarPrecio,
} from '../validators/quote-validators';
import { diasEntre, hoyISO } from '../utils/dates';

/** La tarifa de servicio es el 10 % del subtotal. */
export const PORCENTAJE_SERVICIO = 0.1;

export type QuoteResult = { ok: true; cotizacion: Quote } | { ok: false; errores: QuoteErrors };

/**
 * Cálculo puro de la cotización (sin validar). Se exporta aparte para probarlo fácilmente.
 * noches × precio = subtotal; total = subtotal + limpieza + servicio (10 % del subtotal).
 */
export const calcularCotizacion = (
  entrada: QuoteInput,
  precioNoche: number,
  tarifaLimpieza: number,
): Quote => {
  const noches = diasEntre(entrada.llegada, entrada.salida);
  const subtotal = noches * precioNoche;
  const tarifaServicio = Math.round(subtotal * PORCENTAJE_SERVICIO);
  return {
    llegada: entrada.llegada,
    salida: entrada.salida,
    huespedes: entrada.huespedes,
    noches,
    precioNoche,
    subtotal,
    tarifaLimpieza,
    tarifaServicio,
    total: subtotal + tarifaLimpieza + tarifaServicio,
  };
};

@Injectable({ providedIn: 'root' })
export class QuoteService {
  /**
   * Valida todas las reglas de negocio y, solo si se cumplen, genera la cotización.
   * `hoy` se puede pasar para controlar la fecha en las pruebas.
   */
  cotizar(alojamiento: Accommodation, entrada: QuoteInput, hoy: string = hoyISO()): QuoteResult {
    const errores: QuoteErrors = {
      ...validarFechas(entrada.llegada, entrada.salida, hoy),
    };
    const errorHuespedes = validarHuespedes(entrada.huespedes, alojamiento.capacidad);
    if (errorHuespedes) {
      errores.huespedes = errorHuespedes;
    }
    const errorPrecio = validarPrecio(alojamiento.precioNoche);
    if (errorPrecio) {
      errores.precio = errorPrecio;
    }

    if (Object.keys(errores).length > 0) {
      return { ok: false, errores };
    }
    return {
      ok: true,
      cotizacion: calcularCotizacion(entrada, alojamiento.precioNoche, alojamiento.tarifaLimpieza),
    };
  }
}

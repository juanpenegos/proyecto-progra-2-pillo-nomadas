import { diasEntre, esFechaValida } from '../utils/dates';

export interface QuoteErrors {
  llegada?: string;
  salida?: string;
  huespedes?: string;
  precio?: string;
}

export interface QuoteInput {
  llegada: string;
  salida: string;
  huespedes: number;
}

/**
 * Reglas de fechas: salida posterior a llegada y llegada no anterior a hoy.
 * Son funciones puras: no dependen del navegador, así que se pueden probar con una fecha de "hoy" controlada.
 */
export const validarFechas = (
  llegada: string,
  salida: string,
  hoy: string,
): Pick<QuoteErrors, 'llegada' | 'salida'> => {
  const errores: Pick<QuoteErrors, 'llegada' | 'salida'> = {};

  if (!esFechaValida(llegada)) {
    errores.llegada = 'Selecciona la fecha de llegada';
  } else if (diasEntre(hoy, llegada) < 0) {
    errores.llegada = 'La fecha de llegada no puede ser anterior a hoy';
  }

  if (!esFechaValida(salida)) {
    errores.salida = 'Selecciona la fecha de salida';
  } else if (esFechaValida(llegada) && diasEntre(llegada, salida) <= 0) {
    errores.salida = 'La fecha de salida debe ser posterior a la de llegada';
  }

  return errores;
};

/** Reglas de huéspedes: mayor que cero y sin superar la capacidad. */
export const validarHuespedes = (huespedes: number, capacidad: number): string | undefined => {
  if (!Number.isInteger(huespedes) || huespedes <= 0) {
    return 'Ingresa al menos 1 huésped';
  }
  if (huespedes > capacidad) {
    return `Este alojamiento admite máximo ${capacidad} huéspedes`;
  }
  return undefined;
};

/** Regla de precio: el precio por noche debe ser mayor que cero. */
export const validarPrecio = (precioNoche: number): string | undefined =>
  precioNoche > 0 ? undefined : 'Este alojamiento no tiene un precio válido para cotizar';

/** Texto que debe cumplir el nombre y el correo de la reserva. */
export const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const nombreValido = (nombre: string): boolean => nombre.trim().length >= 2;
export const correoValido = (correo: string): boolean => CORREO_VALIDO.test(correo.trim());

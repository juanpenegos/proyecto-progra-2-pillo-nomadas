export type BookingStatus = 'CONFIRMADA';

export interface Booking {
  /** Formato RES-<marca de tiempo>. */
  id: string;
  alojamientoId: number;
  alojamientoNombre: string;
  ciudad: string;
  imagenPrincipal: string;
  llegada: string;
  salida: string;
  huespedes: number;
  noches: number;
  subtotal: number;
  tarifaLimpieza: number;
  tarifaServicio: number;
  total: number;
  nombreHuesped: string;
  correo: string;
  estado: BookingStatus;
}

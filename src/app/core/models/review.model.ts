export interface Review {
  id: number;
  alojamientoId: number;
  usuario: string;
  calificacion: number;
  comentario: string;
  /** Fecha en formato AAAA-MM-DD. */
  fecha: string;
}

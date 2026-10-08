import { Accommodation } from '../../core/models/accommodation.model';
import { Review } from '../../core/models/review.model';

export interface HomeStats {
  alojamientosActivos: number;
  ciudades: number;
  resenas: number;
  /** Promedio de calificación con un decimal, por ejemplo "4.7". */
  calificacionPromedio: string;
}

/**
 * Calcula las cifras de la franja verde del inicio con los datos reales.
 * Si algún día se quiere cambiar qué se cuenta, se cambia solo aquí.
 */
export const calcularCifras = (activos: Accommodation[], resenas: Review[]): HomeStats => {
  const idsActivos = new Set(activos.map((a) => a.id));
  const suma = activos.reduce((total, a) => total + a.calificacion, 0);
  const promedio = activos.length === 0 ? 0 : suma / activos.length;

  return {
    alojamientosActivos: activos.length,
    ciudades: new Set(activos.map((a) => a.ciudad)).size,
    resenas: resenas.filter((r) => idsActivos.has(r.alojamientoId)).length,
    calificacionPromedio: promedio.toFixed(1),
  };
};

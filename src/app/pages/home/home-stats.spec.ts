import { Accommodation } from '../../core/models/accommodation.model';
import { Review } from '../../core/models/review.model';
import { calcularCifras } from './home-stats';

const alojamiento = (id: number, ciudad: string, calificacion: number): Accommodation => ({
  id, nombre: `A${id}`, descripcion: '', ciudad, ubicacion: ciudad, tipo: 'Casa', capacidad: 2,
  habitaciones: 1, camas: 1, banos: 1, precioNoche: 1000, tarifaLimpieza: 100, calificacion, activo: true,
  imagenPrincipal: '', imagenes: [], servicios: [], reglas: [],
});

const resena = (id: number, alojamientoId: number): Review => ({
  id, alojamientoId, usuario: 'x', calificacion: 5, comentario: 'x', fecha: '2026-09-01',
});

describe('calcularCifras', () => {
  it('cuenta alojamientos, ciudades distintas y reseñas de alojamientos activos', () => {
    const activos = [alojamiento(1, 'Bogotá', 4.8), alojamiento(2, 'Bogotá', 4.6), alojamiento(3, 'Cali', 4.5)];
    const resenas = [resena(1, 1), resena(2, 2), resena(3, 99)]; // la 99 es de un alojamiento inactivo
    const c = calcularCifras(activos, resenas);
    expect(c.alojamientosActivos).toBe(3);
    expect(c.ciudades).toBe(2);
    expect(c.resenas).toBe(2);
  });

  it('promedia la calificación con un decimal', () => {
    const activos = [alojamiento(1, 'A', 4.8), alojamiento(2, 'B', 4.9), alojamiento(3, 'C', 4.7)];
    expect(calcularCifras(activos, []).calificacionPromedio).toBe('4.8');
  });

  it('no falla sin alojamientos', () => {
    const c = calcularCifras([], []);
    expect(c.alojamientosActivos).toBe(0);
    expect(c.calificacionPromedio).toBe('0.0');
  });
});

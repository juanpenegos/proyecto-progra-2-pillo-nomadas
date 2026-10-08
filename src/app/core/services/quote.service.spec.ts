import { Accommodation } from '../models/accommodation.model';
import { QuoteService, calcularCotizacion } from './quote.service';

const HOY = '2026-10-07';

const guatape: Accommodation = {
  id: 3, nombre: 'Cabaña en Guatapé', descripcion: '', ciudad: 'Guatapé', ubicacion: 'Guatapé, Antioquia',
  tipo: 'Cabaña', capacidad: 6, habitaciones: 3, camas: 4, banos: 2, precioNoche: 350000, tarifaLimpieza: 60000,
  calificacion: 4.7, activo: true, imagenPrincipal: '', imagenes: [], servicios: [], reglas: [],
};

describe('calcularCotizacion', () => {
  it('calcula noches, subtotal, limpieza, servicio del 10 % y total (ejemplo del diseño)', () => {
    const q = calcularCotizacion({ llegada: '2026-10-10', salida: '2026-10-23', huespedes: 2 }, 350000, 60000);
    expect(q.noches).toBe(13);
    expect(q.subtotal).toBe(4550000);
    expect(q.tarifaLimpieza).toBe(60000);
    expect(q.tarifaServicio).toBe(455000);
    expect(q.total).toBe(5065000);
  });

  it('una sola noche', () => {
    const q = calcularCotizacion({ llegada: '2026-10-10', salida: '2026-10-11', huespedes: 1 }, 180000, 45000);
    expect(q.noches).toBe(1);
    expect(q.subtotal).toBe(180000);
    expect(q.tarifaServicio).toBe(18000);
    expect(q.total).toBe(180000 + 45000 + 18000);
  });

  it('la tarifa de servicio se redondea a pesos enteros', () => {
    const q = calcularCotizacion({ llegada: '2026-10-10', salida: '2026-10-11', huespedes: 1 }, 123456, 0);
    expect(Number.isInteger(q.tarifaServicio)).toBe(true);
    expect(q.tarifaServicio).toBe(12346);
  });

  it('guarda los datos de entrada en la cotización', () => {
    const q = calcularCotizacion({ llegada: '2026-10-10', salida: '2026-10-12', huespedes: 3 }, 100000, 0);
    expect(q).toMatchObject({ llegada: '2026-10-10', salida: '2026-10-12', huespedes: 3, precioNoche: 100000 });
  });
});

describe('QuoteService.cotizar', () => {
  const servicio = new QuoteService();

  it('genera la cotización cuando todas las reglas se cumplen', () => {
    const r = servicio.cotizar(guatape, { llegada: '2026-10-10', salida: '2026-10-12', huespedes: 4 }, HOY);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cotizacion.total).toBe(2 * 350000 + 60000 + 70000);
    }
  });

  it('no cotiza sin fechas', () => {
    const r = servicio.cotizar(guatape, { llegada: '', salida: '', huespedes: 1 }, HOY);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.llegada).toBeDefined();
      expect(r.errores.salida).toBeDefined();
    }
  });

  it('no cotiza si la llegada es anterior a hoy', () => {
    const r = servicio.cotizar(guatape, { llegada: '2026-10-01', salida: '2026-10-05', huespedes: 1 }, HOY);
    expect(r.ok).toBe(false);
  });

  it('no cotiza si la salida no es posterior a la llegada', () => {
    const r = servicio.cotizar(guatape, { llegada: '2026-10-12', salida: '2026-10-12', huespedes: 1 }, HOY);
    expect(r.ok).toBe(false);
  });

  it('no cotiza con cero huéspedes ni con más que la capacidad', () => {
    const base = { llegada: '2026-10-10', salida: '2026-10-12' };
    expect(servicio.cotizar(guatape, { ...base, huespedes: 0 }, HOY).ok).toBe(false);
    expect(servicio.cotizar(guatape, { ...base, huespedes: 7 }, HOY).ok).toBe(false);
    expect(servicio.cotizar(guatape, { ...base, huespedes: 6 }, HOY).ok).toBe(true);
  });

  it('no cotiza si el precio por noche no es mayor que cero', () => {
    const gratis = { ...guatape, precioNoche: 0 };
    const r = servicio.cotizar(gratis, { llegada: '2026-10-10', salida: '2026-10-12', huespedes: 1 }, HOY);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errores.precio).toBeDefined();
    }
  });

  it('reúne todos los errores a la vez', () => {
    const r = servicio.cotizar(guatape, { llegada: '', salida: '', huespedes: 9 }, HOY);
    if (!r.ok) {
      expect(Object.keys(r.errores).sort()).toEqual(['huespedes', 'llegada', 'salida']);
    }
  });
});

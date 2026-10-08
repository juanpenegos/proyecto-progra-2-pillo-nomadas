import { Accommodation } from '../models/accommodation.model';
import { Quote } from '../models/quote.model';
import { BookingService } from './booking.service';

const alojamiento: Accommodation = {
  id: 3, nombre: 'Cabaña en Guatapé', descripcion: '', ciudad: 'Guatapé', ubicacion: 'Guatapé, Antioquia',
  tipo: 'Cabaña', capacidad: 6, habitaciones: 3, camas: 4, banos: 2, precioNoche: 350000, tarifaLimpieza: 60000,
  calificacion: 4.7, activo: true, imagenPrincipal: 'assets/images/guatape.jpg', imagenes: [], servicios: [], reglas: [],
};

const cotizacion: Quote = {
  llegada: '2026-10-10', salida: '2026-10-12', huespedes: 2, noches: 2, precioNoche: 350000,
  subtotal: 700000, tarifaLimpieza: 60000, tarifaServicio: 70000, total: 830000,
};

describe('BookingService', () => {
  it('empieza sin reservas', () => {
    expect(new BookingService().reservas()).toEqual([]);
  });

  it('crea una reserva CONFIRMADA con todos los datos requeridos', () => {
    const servicio = new BookingService();
    const r = servicio.crear(alojamiento, cotizacion, '  Ana Pérez ', ' ana@correo.com ');

    expect(r.id).toMatch(/^RES-\d+$/);
    expect(r.estado).toBe('CONFIRMADA');
    expect(r).toMatchObject({
      alojamientoId: 3, alojamientoNombre: 'Cabaña en Guatapé', ciudad: 'Guatapé',
      llegada: '2026-10-10', salida: '2026-10-12', huespedes: 2, noches: 2, total: 830000,
      nombreHuesped: 'Ana Pérez', correo: 'ana@correo.com',
    });
    expect(servicio.reservas()).toEqual([r]);
  });

  it('la reserva más reciente aparece primero y los ids no se repiten', () => {
    const servicio = new BookingService();
    const a = servicio.crear(alojamiento, cotizacion, 'Ana Pérez', 'ana@correo.com');
    const b = servicio.crear(alojamiento, cotizacion, 'Luis Gómez', 'luis@correo.com');
    expect(a.id).not.toBe(b.id);
    expect(servicio.reservas().map((r) => r.id)).toEqual([b.id, a.id]);
  });

  it('obtener devuelve la reserva por id o undefined', () => {
    const servicio = new BookingService();
    const r = servicio.crear(alojamiento, cotizacion, 'Ana Pérez', 'ana@correo.com');
    expect(servicio.obtener(r.id)).toEqual(r);
    expect(servicio.obtener('RES-0')).toBeUndefined();
  });

  it('no reserva sin una cotización válida', () => {
    const servicio = new BookingService();
    const sinNoches: Quote = { ...cotizacion, noches: 0, total: 0 };
    expect(() => servicio.crear(alojamiento, sinNoches, 'Ana Pérez', 'ana@correo.com')).toThrow();
    expect(servicio.reservas()).toEqual([]);
  });

  it('no reserva con nombre o correo inválidos', () => {
    const servicio = new BookingService();
    expect(() => servicio.crear(alojamiento, cotizacion, '', 'ana@correo.com')).toThrow();
    expect(() => servicio.crear(alojamiento, cotizacion, 'Ana Pérez', 'sin-arroba')).toThrow();
    expect(servicio.reservas()).toEqual([]);
  });
});

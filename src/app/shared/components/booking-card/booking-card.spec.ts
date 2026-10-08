import { TestBed } from '@angular/core/testing';
import { Booking } from '../../../core/models/booking.model';
import { BookingCard } from './booking-card';

const reserva: Booking = {
  id: 'RES-1790659536017', alojamientoId: 2, alojamientoNombre: 'Apartamento frente al mar', ciudad: 'Cartagena',
  imagenPrincipal: 'assets/images/cartagena.jpg', llegada: '2026-09-30', salida: '2026-10-08', huespedes: 3, noches: 8,
  subtotal: 3360000, tarifaLimpieza: 70000, tarifaServicio: 336000, total: 3766000,
  nombreHuesped: 'Juan Penagos', correo: 'juan@correo.com', estado: 'CONFIRMADA',
};

describe('BookingCard', () => {
  const montar = async (r: Booking) => {
    await TestBed.configureTestingModule({ imports: [BookingCard] }).compileComponents();
    const fixture = TestBed.createComponent(BookingCard);
    fixture.componentRef.setInput('reserva', r);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  const normalizado = (html: HTMLElement) => (html.textContent ?? '').replace(/\s+/g, ' ');

  it('muestra alojamiento, ciudad, fechas, huéspedes, total y estado', async () => {
    const texto = normalizado(await montar(reserva));
    expect(texto).toContain('CONFIRMADA');
    expect(texto).toContain('RES-1790659536017');
    expect(texto).toContain('Apartamento frente al mar');
    expect(texto).toContain('Cartagena');
    expect(texto).toContain('30 de septiembre de 2026');
    expect(texto).toContain('8 de octubre de 2026');
    expect(texto).toContain('3 personas');
    expect(texto).toContain('Juan Penagos');
    expect(texto).toContain('$ 3.766.000');
    expect(texto).toContain('8 noches');
  });

  it('muestra el desglose de subtotal, limpieza y servicio', async () => {
    const texto = normalizado(await montar(reserva));
    expect(texto).toContain('Subtotal: $ 3.360.000');
    expect(texto).toContain('Limpieza: $ 70.000');
    expect(texto).toContain('Servicio (10%): $ 336.000');
  });

  it('usa singular para una noche y una persona', async () => {
    const texto = normalizado(await montar({ ...reserva, noches: 1, huespedes: 1 }));
    expect(texto).toContain('1 noche');
    expect(texto).toContain('1 persona');
    expect(texto).not.toContain('1 personas');
  });
});

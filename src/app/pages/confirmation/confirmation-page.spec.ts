import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Accommodation } from '../../core/models/accommodation.model';
import { Quote } from '../../core/models/quote.model';
import { BookingService } from '../../core/services/booking.service';
import { ConfirmationPage } from './confirmation-page';

const alojamiento: Accommodation = {
  id: 3, nombre: 'Cabaña en Guatapé', descripcion: '', ciudad: 'Guatapé', ubicacion: 'Guatapé, Antioquia',
  tipo: 'Cabaña', capacidad: 6, habitaciones: 3, camas: 4, banos: 2, precioNoche: 350000, tarifaLimpieza: 60000,
  calificacion: 4.7, activo: true, imagenPrincipal: '', imagenes: [], servicios: [], reglas: [],
};

const cotizacion: Quote = {
  llegada: '2026-10-01', salida: '2026-10-14', huespedes: 2, noches: 13, precioNoche: 350000,
  subtotal: 4550000, tarifaLimpieza: 60000, tarifaServicio: 455000, total: 5065000,
};

describe('ConfirmationPage', () => {
  const abrir = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'reserva-confirmada/:id', component: ConfirmationPage }])],
    });
    const reserva = TestBed.inject(BookingService).crear(alojamiento, cotizacion, 'Juan Penagos', 'juan@correo.com');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url.replace('{id}', reserva.id));
    await harness.fixture.whenStable();
    harness.detectChanges();
    return { harness, reserva, html: harness.routeNativeElement as HTMLElement };
  };

  it('muestra el resumen de la reserva recién creada', async () => {
    const { html, reserva } = await abrir('/reserva-confirmada/{id}');
    const texto = (html.textContent ?? '').replace(/\s+/g, ' ');
    expect(html.querySelectorAll('h1').length).toBe(1);
    expect(texto).toContain('¡Reserva confirmada!');
    expect(texto).toContain('Hola Juan Penagos, tu reserva en Cabaña en Guatapé ha sido registrada exitosamente.');
    expect(texto).toContain(reserva.id);
    expect(texto).toContain('1 de octubre de 2026');
    expect(texto).toContain('14 de octubre de 2026');
    expect(texto).toContain('13');
    expect(texto).toContain('$ 5.065.000');
    expect(texto).toContain('CONFIRMADA');
  });

  it('ofrece ir a Mis reservas y al inicio', async () => {
    const { html } = await abrir('/reserva-confirmada/{id}');
    const enlaces = Array.from(html.querySelectorAll('a')).map((a) => [a.textContent?.trim(), a.getAttribute('href')]);
    expect(enlaces).toContainEqual(['Ver mis reservas', '/mis-reservas']);
    expect(enlaces).toContainEqual(['Ir al inicio', '/']);
  });

  it('si la reserva no existe (por ejemplo, tras recargar) lo informa y ofrece explorar', async () => {
    const { harness, html } = await abrir('/reserva-confirmada/RES-0');
    const texto = html.textContent ?? '';
    expect(texto).toContain('No encontramos esta reserva.');
    expect(html.querySelectorAll('h1').length).toBe(1);

    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    html.querySelector<HTMLButtonElement>('button')!.click();
    expect(navegar).toHaveBeenCalledWith(['/explorar']);
    harness.detectChanges();
  });
});

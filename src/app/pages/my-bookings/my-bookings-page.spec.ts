import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Accommodation } from '../../core/models/accommodation.model';
import { Quote } from '../../core/models/quote.model';
import { BookingService } from '../../core/services/booking.service';
import { MyBookingsPage } from './my-bookings-page';

const alojamiento = (id: number, nombre: string): Accommodation => ({
  id, nombre, descripcion: '', ciudad: 'Cartagena', ubicacion: 'Cartagena', tipo: 'Casa', capacidad: 4,
  habitaciones: 1, camas: 1, banos: 1, precioNoche: 100000, tarifaLimpieza: 10000, calificacion: 4.5, activo: true,
  imagenPrincipal: '', imagenes: [], servicios: [], reglas: [],
});

const cotizacion: Quote = {
  llegada: '2026-10-10', salida: '2026-10-12', huespedes: 2, noches: 2, precioNoche: 100000,
  subtotal: 200000, tarifaLimpieza: 10000, tarifaServicio: 20000, total: 230000,
};

describe('MyBookingsPage', () => {
  /** `precargar` permite crear reservas antes de abrir la página. */
  const montar = async (precargar: (servicio: BookingService) => void = () => undefined) => {
    await TestBed.configureTestingModule({
      imports: [MyBookingsPage],
      providers: [provideRouter([])],
    }).compileComponents();
    precargar(TestBed.inject(BookingService));
    const fixture = TestBed.createComponent(MyBookingsPage);
    await fixture.whenStable();
    return fixture;
  };

  const html = (f: { nativeElement: unknown }) => f.nativeElement as HTMLElement;

  it('sin reservas muestra el mensaje y un botón para explorar', async () => {
    const fixture = await montar();
    const texto = html(fixture).textContent ?? '';
    expect(texto).toContain('Aún no tienes reservas registradas');
    expect(texto).toContain('No tienes reservas aún.');
    expect(html(fixture).querySelectorAll('app-booking-card').length).toBe(0);

    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const boton = Array.from(html(fixture).querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Explorar alojamientos'),
    );
    boton!.click();
    expect(navegar).toHaveBeenCalledWith(['/explorar']);
  });

  it('con una reserva dice "1 reserva registrada" y la muestra', async () => {
    const fixture = await montar((servicio) => {
      servicio.crear(alojamiento(1, 'Casa A'), cotizacion, 'Ana Pérez', 'ana@correo.com');
    });
    expect(html(fixture).textContent).toContain('1 reserva registrada');
    expect(html(fixture).querySelectorAll('app-booking-card').length).toBe(1);
    expect(html(fixture).textContent).not.toContain('No tienes reservas aún.');
  });

  it('con varias reservas usa el plural y muestra la más reciente primero', async () => {
    const fixture = await montar((servicio) => {
      servicio.crear(alojamiento(1, 'Casa A'), cotizacion, 'Ana Pérez', 'ana@correo.com');
      servicio.crear(alojamiento(2, 'Casa B'), cotizacion, 'Ana Pérez', 'ana@correo.com');
    });
    expect(html(fixture).textContent).toContain('2 reservas registradas');
    const nombres = Array.from(html(fixture).querySelectorAll('.reserva__nombre')).map((e) => e.textContent?.trim());
    expect(nombres).toEqual(['Casa B', 'Casa A']);
  });

  it('tiene un solo h1 y el botón "Nueva reserva" lleva a Explorar', async () => {
    const fixture = await montar();
    expect(html(fixture).querySelectorAll('h1').length).toBe(1);
    const enlace = Array.from(html(fixture).querySelectorAll('a')).find((a) => a.textContent?.includes('Nueva reserva'));
    expect(enlace?.getAttribute('href')).toBe('/explorar');
  });
});

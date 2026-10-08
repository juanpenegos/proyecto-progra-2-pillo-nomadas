import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Accommodation } from '../../core/models/accommodation.model';
import { MarketplaceData } from '../../core/models/marketplace-data.model';
import { Quote } from '../../core/models/quote.model';
import { AccommodationRepository } from '../../core/repositories/accommodation.repository';
import { BookingService } from '../../core/services/booking.service';
import { ReviewService } from '../../core/services/review.service';
import { ReviewFormPage } from './review-form-page';

const alojamiento = (id: number, activo = true): Accommodation => ({
  id, nombre: `Alojamiento ${id}`, descripcion: '', ciudad: 'Cartagena', ubicacion: 'Cartagena', tipo: 'Casa',
  capacidad: 4, habitaciones: 1, camas: 1, banos: 1, precioNoche: 100000, tarifaLimpieza: 10000, calificacion: 4.5,
  activo, imagenPrincipal: '', imagenes: [], servicios: [], reglas: [],
});

const datos: MarketplaceData = { alojamientos: [alojamiento(1), alojamiento(2, false)], resenas: [] };

class RepositorioFalso extends AccommodationRepository {
  getData(): Promise<MarketplaceData> {
    return Promise.resolve(datos);
  }
}

const cotizacion: Quote = {
  llegada: '2026-10-10', salida: '2026-10-12', huespedes: 2, noches: 2, precioNoche: 100000,
  subtotal: 200000, tarifaLimpieza: 10000, tarifaServicio: 20000, total: 230000,
};

describe('ReviewFormPage', () => {
  const abrir = async (url: string, precargar: (reservas: BookingService) => void = () => undefined) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'alojamientos/:id/resena', component: ReviewFormPage },
          { path: 'alojamientos/:id', component: ReviewFormPage },
        ]),
        { provide: AccommodationRepository, useValue: new RepositorioFalso() },
      ],
    });
    precargar(TestBed.inject(BookingService));
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await esperar(harness);
    return { harness, html: harness.routeNativeElement as HTMLElement };
  };

  const esperar = async (harness: RouterTestingHarness) => {
    await harness.fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };

  const escribir = (html: HTMLElement, valor: string) => {
    const campo = html.querySelector<HTMLTextAreaElement>('#resena-comentario')!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const enviar = async (harness: RouterTestingHarness, html: HTMLElement) => {
    html.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await esperar(harness);
  };

  it('muestra el formulario con un solo h1 y el nombre del alojamiento', async () => {
    const { html } = await abrir('/alojamientos/1/resena');
    expect(html.querySelectorAll('h1').length).toBe(1);
    expect(html.querySelector('h1')?.textContent).toBe('Escribir una reseña');
    expect(html.textContent).toContain('Alojamiento 1');
    expect(html.textContent).toContain('Tu calificación');
    expect(html.textContent).toContain('Tu comentario');
  });

  it('al enviar vacío muestra los errores de calificación y comentario y no guarda', async () => {
    const { harness, html } = await abrir('/alojamientos/1/resena');
    await enviar(harness, html);
    expect(html.textContent).toContain('Selecciona una calificación de 1 a 5 estrellas');
    expect(html.textContent).toContain('Escribe tu comentario');
    expect(await TestBed.inject(ReviewService).getAll()).toEqual([]);
  });

  it('un comentario de solo espacios cuenta como vacío', async () => {
    const { harness, html } = await abrir('/alojamientos/1/resena');
    html.querySelector<HTMLButtonElement>('[aria-label="4 estrellas"]')!.click();
    escribir(html, '    ');
    await enviar(harness, html);
    expect(html.textContent).toContain('Escribe tu comentario');
    expect(await TestBed.inject(ReviewService).getAll()).toEqual([]);
  });

  it('muestra la descripción de la calificación elegida', async () => {
    const { harness, html } = await abrir('/alojamientos/1/resena');
    html.querySelector<HTMLButtonElement>('[aria-label="3 estrellas"]')!.click();
    harness.detectChanges();
    expect(html.textContent).toContain('3 de 5 (Bueno)');
  });

  it('con datos válidos guarda la reseña (con el nombre de la última reserva) y vuelve al detalle', async () => {
    const { harness, html } = await abrir('/alojamientos/1/resena', (reservas) => {
      reservas.crear(alojamiento(1), cotizacion, 'Juan Penagos', 'juan@correo.com');
    });
    html.querySelector<HTMLButtonElement>('[aria-label="5 estrellas"]')!.click();
    escribir(html, 'Una estadía excelente.');
    await enviar(harness, html);

    const guardadas = await TestBed.inject(ReviewService).getByAccommodation(1);
    expect(guardadas.length).toBe(1);
    expect(guardadas[0]).toMatchObject({ usuario: 'Juan Penagos', calificacion: 5, comentario: 'Una estadía excelente.' });
    expect(TestBed.inject(Router).url).toBe('/alojamientos/1#resenas');
  });

  it('sin reservas previas firma como "Visitante"', async () => {
    const { harness, html } = await abrir('/alojamientos/1/resena');
    html.querySelector<HTMLButtonElement>('[aria-label="4 estrellas"]')!.click();
    escribir(html, 'Muy bien.');
    await enviar(harness, html);
    expect((await TestBed.inject(ReviewService).getAll())[0].usuario).toBe('Visitante');
  });

  it('Cancelar vuelve al detalle sin guardar nada', async () => {
    const { harness, html } = await abrir('/alojamientos/1/resena');
    const cancelar = Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes('Cancelar'))!;
    cancelar.click();
    await esperar(harness);
    expect(TestBed.inject(Router).url).toBe('/alojamientos/1');
    expect(await TestBed.inject(ReviewService).getAll()).toEqual([]);
  });

  it('un alojamiento inactivo o inexistente muestra "no encontrado"', async () => {
    const { html } = await abrir('/alojamientos/2/resena');
    expect(html.textContent).toContain('No encontramos lo que buscas.');
  });
});

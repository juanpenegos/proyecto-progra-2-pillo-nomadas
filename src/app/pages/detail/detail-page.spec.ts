import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Accommodation } from '../../core/models/accommodation.model';
import { MarketplaceData } from '../../core/models/marketplace-data.model';
import { AccommodationRepository } from '../../core/repositories/accommodation.repository';
import { BookingService } from '../../core/services/booking.service';
import { hoyISO } from '../../core/utils/dates';
import { DetailPage } from './detail-page';

const crear = (id: number, activo = true, imagenes: string[] = ['a.jpg', 'b.jpg']): Accommodation => ({
  id, nombre: `Alojamiento ${id}`, descripcion: `Descripción ${id}`, ciudad: 'Guatapé', ubicacion: 'Guatapé, Antioquia',
  tipo: 'Cabaña', capacidad: 3, habitaciones: 2, camas: 1, banos: 2, precioNoche: 100000, tarifaLimpieza: 20000,
  calificacion: 4.7, activo, imagenPrincipal: imagenes[0] ?? '', imagenes, servicios: ['Wi-Fi', 'Cocina'],
  reglas: ['No fumar'],
});

const datos: MarketplaceData = {
  alojamientos: [crear(1), crear(2), crear(3, false)],
  resenas: [
    { id: 1, alojamientoId: 1, usuario: 'Laura Gómez', calificacion: 5, comentario: 'Excelente lugar.', fecha: '2026-09-23' },
    { id: 2, alojamientoId: 1, usuario: 'Carlos Ruiz', calificacion: 4, comentario: 'Muy bien.', fecha: '2026-09-02' },
  ],
};

class RepositorioFalso extends AccommodationRepository {
  fallar = false;
  getData(): Promise<MarketplaceData> {
    return this.fallar ? Promise.reject(new Error('sin red')) : Promise.resolve(datos);
  }
}

describe('DetailPage', () => {
  let repositorio: RepositorioFalso;

  // Fechas relativas a hoy: así las pruebas no dependen del día en que se ejecuten.
  const sumarDias = (dias: number): string => {
    const f = new Date();
    f.setDate(f.getDate() + dias);
    return hoyISO(f);
  };

  /** Deja correr las tareas pendientes (la carga de datos es asíncrona) y refresca la vista. */
  const esperar = async (harness: RouterTestingHarness) => {
    await harness.fixture.whenStable();
    await new Promise((resolver) => setTimeout(resolver, 0));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };

  const abrir = async (url: string) => {
    repositorio = new RepositorioFalso();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'alojamientos/:id', component: DetailPage },
          { path: 'reserva-confirmada/:id', component: DetailPage },
        ]),
        { provide: AccommodationRepository, useValue: repositorio },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await esperar(harness);
    return { harness, html: harness.routeNativeElement as HTMLElement };
  };

  const escribir = (html: HTMLElement, selector: string, valor: string) => {
    const campo = html.querySelector<HTMLInputElement>(selector)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const pulsar = async (harness: RouterTestingHarness, el: Element | null | undefined) => {
    (el as HTMLElement).click();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };

  const botonPorTexto = (html: HTMLElement, texto: string) =>
    Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes(texto));

  const cotizar = async (harness: RouterTestingHarness, html: HTMLElement, llegada: string, salida: string) => {
    escribir(html, '#cotizar-llegada', llegada);
    escribir(html, '#cotizar-salida', salida);
    await pulsar(harness, botonPorTexto(html, 'Calcular cotización'));
  };

  it('muestra los datos del alojamiento, sus servicios, reglas y reseñas', async () => {
    const { html } = await abrir('/alojamientos/1');
    expect(html.querySelectorAll('h1').length).toBe(1);
    expect(html.querySelector('h1')?.textContent).toBe('Alojamiento 1');
    const texto = html.textContent ?? '';
    expect(texto).toContain('Guatapé, Antioquia');
    expect(texto).toContain('3 huéspedes');
    expect(texto).toContain('Descripción 1');
    expect(texto).toContain('Wi-Fi');
    expect(texto).toContain('No fumar');
    expect(texto).toContain('Laura Gómez');
    expect(html.querySelectorAll('app-review-card').length).toBe(2);
    expect(html.querySelector('iframe')).toBeTruthy();
  });

  it('las reseñas aparecen de la más reciente a la más antigua', async () => {
    const { html } = await abrir('/alojamientos/1');
    const usuarios = Array.from(html.querySelectorAll('.resena__usuario')).map((e) => e.textContent);
    expect(usuarios).toEqual(['Laura Gómez', 'Carlos Ruiz']);
  });

  it('un alojamiento sin reseñas muestra el mensaje para ser el primero', async () => {
    const { html } = await abrir('/alojamientos/2');
    expect(html.textContent).toContain('Aún no hay calificaciones');
    expect(html.textContent).toContain('¡Sé el primero en compartir tu experiencia!');
    expect(html.querySelector('app-review-card')).toBeNull();
  });

  it('un alojamiento inactivo o inexistente muestra "no encontrado"', async () => {
    const inactivo = await abrir('/alojamientos/3');
    expect(inactivo.html.textContent).toContain('No encontramos lo que buscas.');
    TestBed.resetTestingModule();
    const inexistente = await abrir('/alojamientos/999');
    expect(inexistente.html.textContent).toContain('No encontramos lo que buscas.');
  });

  it('muestra un mensaje con opción de reintentar si falla la carga', async () => {
    repositorio = new RepositorioFalso();
    repositorio.fallar = true;
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'alojamientos/:id', component: DetailPage }]),
        { provide: AccommodationRepository, useValue: repositorio },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/alojamientos/1');
    await esperar(harness);
    expect((harness.routeNativeElement as HTMLElement).querySelector('[role="alert"]')).toBeTruthy();
  });

  it('sin fechas muestra los errores junto a cada campo y no genera cotización', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    await pulsar(harness, botonPorTexto(html, 'Calcular cotización'));
    expect(html.querySelector('#cotizar-llegada-error')?.textContent).toContain('Selecciona la fecha de llegada');
    expect(html.querySelector('#cotizar-salida-error')?.textContent).toContain('Selecciona la fecha de salida');
    expect(html.querySelector('app-quote-summary')).toBeNull();
  });

  it('rechaza una llegada anterior a hoy', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    await cotizar(harness, html, sumarDias(-2), sumarDias(2));
    expect(html.querySelector('#cotizar-llegada-error')?.textContent).toContain('anterior a hoy');
    expect(html.querySelector('app-quote-summary')).toBeNull();
  });

  it('rechaza una salida que no es posterior a la llegada', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    await cotizar(harness, html, sumarDias(3), sumarDias(3));
    expect(html.querySelector('#cotizar-salida-error')?.textContent).toContain('posterior');
  });

  it('con fechas válidas muestra la cotización con noches, subtotal, limpieza, 10 % y total', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    await cotizar(harness, html, sumarDias(5), sumarDias(7)); // 2 noches × $100.000
    const filas = Array.from(html.querySelectorAll('.resumen__fila')).map((f) => ({
      nombre: f.querySelector('dt')?.textContent?.trim().replace(/\s/g, ' '),
      valor: f.querySelector('dd')?.textContent?.trim().replace(/\s/g, ' '),
    }));
    expect(filas).toEqual([
      { nombre: '$ 100.000 × 2 noches', valor: '$ 200.000' },
      { nombre: 'Tarifa de limpieza', valor: '$ 20.000' },
      { nombre: 'Tarifa de servicio (10%)', valor: '$ 20.000' },
      { nombre: 'Total', valor: '$ 240.000' },
    ]);
    expect(botonPorTexto(html, 'Reservar')).toBeTruthy();
  });

  it('cambiar los huéspedes después de cotizar invalida la cotización', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    await cotizar(harness, html, sumarDias(5), sumarDias(7));
    expect(html.querySelector('app-quote-summary')).toBeTruthy();

    await pulsar(harness, html.querySelector('[aria-label="Agregar un huésped"]'));
    expect(html.querySelector('app-quote-summary')).toBeNull();
    expect(botonPorTexto(html, 'Reservar')).toBeUndefined(); // sin cotización no se puede reservar
    expect(botonPorTexto(html, 'Calcular cotización')).toBeTruthy();
  });

  it('el formulario de contacto solo aparece después de cotizar y se puede cancelar', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    expect(html.querySelector('app-contact-form')).toBeNull();

    await cotizar(harness, html, sumarDias(5), sumarDias(7));
    await pulsar(harness, botonPorTexto(html, 'Reservar'));
    expect(html.querySelector('app-contact-form')).toBeTruthy();

    await pulsar(harness, html.querySelector('.contacto__cancelar'));
    expect(html.querySelector('app-contact-form')).toBeNull();
    expect(botonPorTexto(html, 'Reservar')).toBeTruthy();
  });

  it('confirma la reserva con datos válidos: la guarda como CONFIRMADA y va a la confirmación', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    await cotizar(harness, html, sumarDias(5), sumarDias(7));
    await pulsar(harness, botonPorTexto(html, 'Reservar'));

    escribir(html, '#contacto-nombre', 'Ana Pérez');
    escribir(html, '#contacto-correo', 'ana@correo.com');
    await pulsar(harness, botonPorTexto(html, 'Confirmar reserva'));

    const reservas = TestBed.inject(BookingService).reservas();
    expect(reservas.length).toBe(1);
    expect(reservas[0]).toMatchObject({ estado: 'CONFIRMADA', alojamientoId: 1, noches: 2, total: 240000, nombreHuesped: 'Ana Pérez' });
    expect(TestBed.inject(Router).url).toBe(`/reserva-confirmada/${reservas[0].id}`);
  });

  it('con datos de contacto inválidos no se crea la reserva', async () => {
    const { harness, html } = await abrir('/alojamientos/1');
    await cotizar(harness, html, sumarDias(5), sumarDias(7));
    await pulsar(harness, botonPorTexto(html, 'Reservar'));

    escribir(html, '#contacto-nombre', 'Ana Pérez');
    escribir(html, '#contacto-correo', 'sin-arroba');
    await pulsar(harness, botonPorTexto(html, 'Confirmar reserva'));

    expect(TestBed.inject(BookingService).reservas().length).toBe(0);
    expect(html.textContent).toContain('Ingresa un correo electrónico válido');
  });

  it('ofrece el enlace "Más fotos" a la galería completa', async () => {
    const { html } = await abrir('/alojamientos/1');
    const enlace = Array.from(html.querySelectorAll('a')).find((a) => a.textContent?.includes('Más fotos'));
    expect(enlace?.getAttribute('href')).toBe('/alojamientos/1/galeria');
  });

  it('ofrece escribir una reseña, tenga o no reseñas', async () => {
    const conResenas = await abrir('/alojamientos/1');
    const enlace1 = Array.from(conResenas.html.querySelectorAll('a')).find((a) => a.textContent?.includes('Escribir una reseña'));
    expect(enlace1?.getAttribute('href')).toBe('/alojamientos/1/resena');
    TestBed.resetTestingModule();

    const sinResenas = await abrir('/alojamientos/2');
    const enlace2 = Array.from(sinResenas.html.querySelectorAll('a')).find((a) => a.textContent?.includes('Escribir una reseña'));
    expect(enlace2?.getAttribute('href')).toBe('/alojamientos/2/resena');
  });
});

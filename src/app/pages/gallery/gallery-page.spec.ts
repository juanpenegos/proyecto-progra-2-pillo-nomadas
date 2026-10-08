import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Accommodation } from '../../core/models/accommodation.model';
import { MarketplaceData } from '../../core/models/marketplace-data.model';
import { AccommodationRepository } from '../../core/repositories/accommodation.repository';
import { GalleryPage } from './gallery-page';

const base = (id: number, activo = true): Accommodation => ({
  id, nombre: `Alojamiento ${id}`, descripcion: '', ciudad: 'Guatapé', ubicacion: 'Guatapé, Antioquia',
  tipo: 'Cabaña', capacidad: 4, habitaciones: 1, camas: 1, banos: 1, precioNoche: 100000, tarifaLimpieza: 10000,
  calificacion: 4.7, activo, imagenPrincipal: 'a.jpg', imagenes: ['a.jpg', 'b.jpg'], servicios: [], reglas: [],
});

const conGaleria: Accommodation = {
  ...base(1),
  galeria: [
    { src: 'g1.jpg', titulo: 'Vista principal', categoria: 'Exterior' },
    { src: 'g2.jpg', titulo: 'Acceso al embalse', categoria: 'Embalse' },
    { src: 'g3.jpg', titulo: 'Fachada de la cabaña', categoria: 'Exterior' },
  ],
};

const datos: MarketplaceData = { alojamientos: [conGaleria, base(2), base(3, false)], resenas: [] };

class RepositorioFalso extends AccommodationRepository {
  getData(): Promise<MarketplaceData> {
    return Promise.resolve(datos);
  }
}

describe('GalleryPage', () => {
  const abrir = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'alojamientos/:id/galeria', component: GalleryPage }]),
        { provide: AccommodationRepository, useValue: new RepositorioFalso() },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    await harness.fixture.whenStable();
    await new Promise((r) => setTimeout(r, 0));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
    return { harness, html: harness.routeNativeElement as HTMLElement };
  };

  const titulos = (html: HTMLElement) =>
    Array.from(html.querySelectorAll('.galeria__titulo')).map((e) => e.textContent?.trim());
  const pestanas = (html: HTMLElement) =>
    Array.from(html.querySelectorAll('.galeria__pestana')).map((e) => e.textContent?.trim());

  it('usa las fotos descritas del alojamiento y cuenta cuántas son', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(html.querySelectorAll('h1').length).toBe(1);
    expect(html.querySelector('h1')?.textContent).toBe('Alojamiento 1');
    expect(titulos(html)).toEqual(['Vista principal', 'Acceso al embalse', 'Fachada de la cabaña']);
    expect(html.textContent).toContain('3 fotografías');
    expect(html.textContent).toContain('Has visto todas las fotos');
  });

  it('crea una pestaña por categoría, sin repetirlas, después de "Todas"', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(pestanas(html)).toEqual(['Todas', 'Exterior', 'Embalse']);
  });

  it('al elegir una categoría muestra solo esas fotos y se puede volver a "Todas"', async () => {
    const { harness, html } = await abrir('/alojamientos/1/galeria');
    const botones = Array.from(html.querySelectorAll<HTMLButtonElement>('.galeria__pestana'));

    botones.find((b) => b.textContent?.trim() === 'Exterior')!.click();
    harness.detectChanges();
    expect(titulos(html)).toEqual(['Vista principal', 'Fachada de la cabaña']);
    expect(html.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('Exterior');

    botones.find((b) => b.textContent?.trim() === 'Todas')!.click();
    harness.detectChanges();
    expect(titulos(html).length).toBe(3);
  });

  it('sin fotos descritas muestra las imágenes del alojamiento bajo "Todas"', async () => {
    const { html } = await abrir('/alojamientos/2/galeria');
    expect(titulos(html)).toEqual(['Foto 1', 'Foto 2']);
    expect(pestanas(html)).toEqual(['Todas']);
  });

  it('el enlace Volver regresa al detalle del alojamiento', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(html.querySelector('.galeria__volver')?.getAttribute('href')).toBe('/alojamientos/1');
  });

  it('un alojamiento inactivo o inexistente muestra "no encontrado"', async () => {
    const { html } = await abrir('/alojamientos/3/galeria');
    expect(html.textContent).toContain('No encontramos lo que buscas.');
  });
});

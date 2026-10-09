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

const S1 = 'Exterior y paisaje';
const S2 = 'Espacios interiores';
const S3 = 'Detalles de la estadía';

// Misma forma que el diseño: 3 fotos, 2 fotos y 2 fotos, con 5 pestañas en un orden propio.
const conGaleria: Accommodation = {
  ...base(1),
  galeria: [
    { src: 'g1.jpg', titulo: 'Vista principal', categoria: 'Exterior', seccion: S1 },
    { src: 'g2.jpg', titulo: 'Acceso al embalse', categoria: 'Habitaciones', seccion: S1 },
    { src: 'g3.jpg', titulo: 'Fachada de la cabaña', categoria: 'Embalse', seccion: S1 },
    { src: 'g4.jpg', titulo: 'Habitación principal', categoria: 'Baños', seccion: S2 },
    { src: 'g5.jpg', titulo: 'Habitación secundaria', categoria: 'Habitaciones', seccion: S2 },
    { src: 'g6.jpg', titulo: 'Acceso al baño', categoria: 'Interiores', seccion: S3 },
    { src: 'g7.jpg', titulo: 'Baño con vista', categoria: 'Embalse', seccion: S3 },
  ],
  galeriaSecciones: [
    { titulo: S1, descripcion: 'La cabaña, su terraza y las vistas.' },
    { titulo: S2, descripcion: 'Ambientes cálidos y luminosos.' },
    { titulo: S3, descripcion: 'Rincones para bajar el ritmo.' },
  ],
  galeriaCategorias: ['Exterior', 'Embalse', 'Interiores', 'Habitaciones', 'Baños'],
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

  const textos = (html: HTMLElement, selector: string) =>
    Array.from(html.querySelectorAll(selector)).map((e) => e.textContent?.trim());

  it('muestra la barra superior, el título, el conteo y la ubicación como en el diseño', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(html.querySelectorAll('h1').length).toBe(1);
    expect(html.querySelector('h1')?.textContent).toBe('Alojamiento 1');
    expect(html.querySelector('.barra__nombre')?.textContent).toBe('Alojamiento 1');
    expect(html.querySelector('.barra__volver')?.getAttribute('href')).toBe('/alojamientos/1');
    expect(textos(html, '.galeria__resumen > *')).toEqual(['7 fotografías', '·', 'Guatapé, Antioquia']);
  });

  it('las pestañas siguen el orden del diseño: Todas, Exterior, Embalse, Interiores, Habitaciones, Baños', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(textos(html, '.galeria__filtro')).toEqual(['Todas', 'Exterior', 'Embalse', 'Interiores', 'Habitaciones', 'Baños']);
    expect(html.querySelector('.galeria__filtro--activo')?.textContent?.trim()).toBe('Todas');
  });

  it('muestra tres secciones con su título y descripción', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(textos(html, '.seccion__titulo')).toEqual([S1, S2, S3]);
    expect(textos(html, '.seccion__descripcion')).toEqual([
      'La cabaña, su terraza y las vistas.',
      'Ambientes cálidos y luminosos.',
      'Rincones para bajar el ritmo.',
    ]);
  });

  it('cada sección usa la forma de mosaico del diseño según su cantidad de fotos', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    const formas = Array.from(html.querySelectorAll('.mosaico')).map((m) => m.className.replace(/\s+/g, ' ').trim());
    expect(formas).toEqual(['mosaico mosaico--tres', 'mosaico mosaico--dos', 'mosaico mosaico--dos-bajo']);
  });

  it('cada foto lleva su pie de foto, en el orden del diseño', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(textos(html, '.foto__pie')).toEqual([
      'Vista principal', 'Acceso al embalse', 'Fachada de la cabaña',
      'Habitación principal', 'Habitación secundaria',
      'Acceso al baño', 'Baño con vista',
    ]);
    expect(html.querySelectorAll('figure img').length).toBe(7);
  });

  it('al elegir una pestaña muestra solo las fotos de esa categoría, y "Todas" vuelve a las secciones', async () => {
    const { harness, html } = await abrir('/alojamientos/1/galeria');
    const boton = (nombre: string) =>
      Array.from(html.querySelectorAll<HTMLButtonElement>('.galeria__filtro')).find((b) => b.textContent?.trim() === nombre)!;

    boton('Embalse').click();
    harness.detectChanges();
    expect(textos(html, '.foto__pie')).toEqual(['Fachada de la cabaña', 'Baño con vista']);
    expect(html.querySelector('.seccion')).toBeNull();
    expect(html.querySelector('[aria-pressed="true"]')?.textContent?.trim()).toBe('Embalse');

    boton('Todas').click();
    harness.detectChanges();
    expect(html.querySelectorAll('.seccion').length).toBe(3);
  });

  it('cada pestaña tiene al menos una foto', async () => {
    const { harness, html } = await abrir('/alojamientos/1/galeria');
    for (const nombre of ['Exterior', 'Embalse', 'Interiores', 'Habitaciones', 'Baños']) {
      Array.from(html.querySelectorAll<HTMLButtonElement>('.galeria__filtro')).find((b) => b.textContent?.trim() === nombre)!.click();
      harness.detectChanges();
      expect(html.querySelectorAll('.foto').length, nombre).toBeGreaterThan(0);
    }
  });

  it('cierra con "Has visto todas las fotos" y el nombre con la región', async () => {
    const { html } = await abrir('/alojamientos/1/galeria');
    expect(textos(html, '.galeria__fin > strong, .galeria__fin > span')).toEqual([
      'Has visto todas las fotos',
      'Alojamiento 1 · Antioquia',
    ]);
  });

  it('sin fotos descritas muestra las imágenes del alojamiento bajo "Todas"', async () => {
    const { html } = await abrir('/alojamientos/2/galeria');
    expect(textos(html, '.foto__pie')).toEqual(['Foto 1', 'Foto 2']);
    expect(textos(html, '.galeria__filtro')).toEqual(['Todas']);
    expect(html.querySelector('.seccion')).toBeNull();
  });

  it('un alojamiento inactivo o inexistente muestra "no encontrado"', async () => {
    const { html } = await abrir('/alojamientos/3/galeria');
    expect(html.textContent).toContain('No encontramos lo que buscas.');
  });
});

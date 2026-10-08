import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Accommodation } from '../../core/models/accommodation.model';
import { MarketplaceData } from '../../core/models/marketplace-data.model';
import { AccommodationRepository } from '../../core/repositories/accommodation.repository';
import { ExplorePage } from './explore-page';

const crear = (
  id: number,
  ciudad: string,
  tipo: 'Apartamento' | 'Casa',
  capacidad: number,
  precio: number,
  calificacion: number,
  activo = true,
): Accommodation => ({
  id, nombre: `Alojamiento ${id}`, descripcion: '', ciudad, ubicacion: ciudad, tipo, capacidad,
  habitaciones: 1, camas: 1, banos: 1, precioNoche: precio, tarifaLimpieza: 10000, calificacion, activo,
  imagenPrincipal: '', imagenes: [], servicios: ['Wi-Fi'], reglas: [],
});

const datos: MarketplaceData = {
  alojamientos: [
    crear(1, 'Bogotá', 'Apartamento', 2, 180000, 4.8),
    crear(2, 'Cartagena', 'Apartamento', 5, 420000, 4.9),
    crear(3, 'Medellín', 'Casa', 8, 520000, 4.6),
    crear(4, 'Armenia', 'Casa', 10, 650000, 5, false), // inactivo
  ],
  resenas: [],
};

class RepositorioFalso extends AccommodationRepository {
  fallar = false;
  getData(): Promise<MarketplaceData> {
    return this.fallar ? Promise.reject(new Error('sin red')) : Promise.resolve(datos);
  }
}

describe('ExplorePage', () => {
  let repositorio: RepositorioFalso;

  const abrir = async (url: string) => {
    repositorio = new RepositorioFalso();
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'explorar', component: ExplorePage }]),
        { provide: AccommodationRepository, useValue: repositorio },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, ExplorePage);
    await harness.fixture.whenStable();
    harness.detectChanges();
    return harness;
  };

  const nombres = (html: HTMLElement) =>
    Array.from(html.querySelectorAll('.tarjeta__nombre')).map((e) => e.textContent?.trim());

  it('sin filtros muestra todos los activos del mejor al peor valorado y el total', async () => {
    const h = await abrir('/explorar');
    const html = h.routeNativeElement as HTMLElement;
    expect(nombres(html)).toEqual(['Alojamiento 2', 'Alojamiento 1', 'Alojamiento 3']);
    expect(html.querySelector('h1')?.textContent).toContain('3 alojamientos encontrados');
  });

  it('aplica los filtros que vienen en la URL', async () => {
    const h = await abrir('/explorar?tipo=Apartamento&huespedes=3');
    const html = h.routeNativeElement as HTMLElement;
    expect(nombres(html)).toEqual(['Alojamiento 2']);
    expect(html.querySelector('h1')?.textContent).toContain('1 alojamiento encontrado');
  });

  it('ordena por menor precio cuando la URL lo pide', async () => {
    const h = await abrir('/explorar?orden=menor-precio');
    expect(nombres(h.routeNativeElement as HTMLElement)).toEqual(['Alojamiento 1', 'Alojamiento 2', 'Alojamiento 3']);
  });

  it('al cambiar un filtro actualiza la URL y la lista', async () => {
    const h = await abrir('/explorar');
    const html = h.routeNativeElement as HTMLElement;
    const ciudad = html.querySelector<HTMLSelectElement>('#filtro-ciudad')!;
    ciudad.value = 'Cartagena';
    ciudad.dispatchEvent(new Event('change', { bubbles: true }));
    await h.fixture.whenStable();
    h.detectChanges();

    expect(TestBed.inject(Router).url).toContain('ciudad=Cartagena');
    expect(nombres(html)).toEqual(['Alojamiento 2']);
  });

  it('informa cuando no hay resultados y "Nueva búsqueda" limpia los filtros', async () => {
    const h = await abrir('/explorar?ciudad=Armenia'); // la única de Armenia está inactiva
    const html = h.routeNativeElement as HTMLElement;
    expect(html.textContent).toContain('No se encontraron resultados para tu búsqueda');
    expect(html.textContent).toContain('Sin resultados.');
    expect(html.querySelectorAll('app-accommodation-card').length).toBe(0);

    const botones = Array.from(html.querySelectorAll<HTMLButtonElement>('button'));
    botones.find((b) => b.textContent?.includes('Nueva búsqueda'))!.click();
    await h.fixture.whenStable();
    h.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/explorar');
    expect(nombres(html).length).toBe(3);
  });

  it('el botón "Limpiar filtros" quita todos los filtros de la URL', async () => {
    const h = await abrir('/explorar?ciudad=Bogotá&orden=mayor-precio');
    const html = h.routeNativeElement as HTMLElement;
    html.querySelector<HTMLButtonElement>('.filtros__limpiar')!.click();
    await h.fixture.whenStable();
    h.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/explorar');
    expect(nombres(html).length).toBe(3);
  });

  it('muestra un mensaje con opción de reintentar si falla la carga', async () => {
    repositorio = new RepositorioFalso();
    repositorio.fallar = true;
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'explorar', component: ExplorePage }]),
        { provide: AccommodationRepository, useValue: repositorio },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/explorar', ExplorePage);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect((harness.routeNativeElement as HTMLElement).querySelector('[role="alert"]')).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Accommodation } from '../../core/models/accommodation.model';
import { MarketplaceData } from '../../core/models/marketplace-data.model';
import { AccommodationRepository } from '../../core/repositories/accommodation.repository';
import { HomePage } from './home-page';

const crear = (id: number, ciudad: string, calificacion: number, activo = true): Accommodation => ({
  id, nombre: `Alojamiento ${id}`, descripcion: '', ciudad, ubicacion: ciudad, tipo: 'Casa', capacidad: id + 1,
  habitaciones: 1, camas: 1, banos: 1, precioNoche: 100000, tarifaLimpieza: 10000, calificacion, activo,
  imagenPrincipal: '', imagenes: [], servicios: ['Wi-Fi'], reglas: [],
});

const datos: MarketplaceData = {
  alojamientos: [
    crear(1, 'Bogotá', 4.5),
    crear(2, 'Cartagena', 4.9),
    crear(3, 'Medellín', 4.7),
    crear(4, 'Bogotá', 4.8),
    crear(5, 'Armenia', 5, false), // inactivo: nunca debe aparecer
  ],
  resenas: [{ id: 1, alojamientoId: 2, usuario: 'Ana', calificacion: 5, comentario: 'x', fecha: '2026-09-01' }],
};

class RepositorioFalso extends AccommodationRepository {
  fallar = false;
  getData(): Promise<MarketplaceData> {
    return this.fallar ? Promise.reject(new Error('sin red')) : Promise.resolve(datos);
  }
}

describe('HomePage', () => {
  let repositorio: RepositorioFalso;

  const montar = async () => {
    repositorio = new RepositorioFalso();
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), { provide: AccommodationRepository, useValue: repositorio }],
    }).compileComponents();
  };

  const abrir = async () => {
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, html: fixture.nativeElement as HTMLElement };
  };

  it('tiene un solo h1', async () => {
    await montar();
    const { html } = await abrir();
    expect(html.querySelectorAll('h1').length).toBe(1);
  });

  it('muestra los 3 alojamientos activos mejor calificados, de mayor a menor', async () => {
    await montar();
    const { html } = await abrir();
    const nombres = Array.from(html.querySelectorAll('.tarjeta__nombre')).map((e) => e.textContent?.trim());
    expect(nombres).toEqual(['Alojamiento 2', 'Alojamiento 4', 'Alojamiento 3']);
  });

  it('crea una tarjeta por ciudad activa, sin repetir ni mostrar inactivas', async () => {
    await montar();
    const { html } = await abrir();
    const ciudades = Array.from(html.querySelectorAll('.destino__nombre')).map((e) => e.textContent?.trim());
    expect(ciudades).toEqual(['Bogotá', 'Cartagena', 'Medellín']);
  });

  it('calcula las cifras con los datos', async () => {
    await montar();
    const { html } = await abrir();
    const valores = Array.from(html.querySelectorAll('.cifras__valor')).map((e) => e.textContent?.trim());
    expect(valores).toEqual(['4', '3', '1', '4.7★']);
  });

  it('muestra un mensaje con opción de reintentar si falla la carga', async () => {
    await montar();
    repositorio.fallar = true;
    const { html } = await abrir();
    expect(html.querySelector('[role="alert"]')).toBeTruthy();
    expect(html.textContent).toContain('Reintentar');
  });

  it('el buscador navega a Explorar con ciudad y huéspedes en la URL', async () => {
    await montar();
    const { fixture, html } = await abrir();
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const ciudad = html.querySelector<HTMLSelectElement>('#buscador-ciudad');
    ciudad!.value = 'Bogotá';
    ciudad!.dispatchEvent(new Event('change'));
    const huespedes = html.querySelector<HTMLSelectElement>('#buscador-huespedes');
    huespedes!.selectedIndex = 3; // opción "3 huéspedes"
    huespedes!.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    html.querySelector<HTMLButtonElement>('.buscador__boton')?.click();
    expect(navegar).toHaveBeenCalledWith(['/explorar'], { queryParams: { ciudad: 'Bogotá', huespedes: 3 } });
  });

  it('el buscador sin criterios navega a Explorar sin parámetros', async () => {
    await montar();
    const { html } = await abrir();
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    html.querySelector<HTMLButtonElement>('.buscador__boton')?.click();
    expect(navegar).toHaveBeenCalledWith(['/explorar'], { queryParams: {} });
  });
});

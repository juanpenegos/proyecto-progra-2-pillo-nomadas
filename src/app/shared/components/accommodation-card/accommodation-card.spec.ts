import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Accommodation } from '../../../core/models/accommodation.model';
import { AccommodationCard } from './accommodation-card';

const base: Accommodation = {
  id: 2, nombre: 'Apartamento frente al mar', descripcion: '', ciudad: 'Cartagena',
  ubicacion: 'Bocagrande, Cartagena', tipo: 'Apartamento', capacidad: 5, habitaciones: 2, camas: 3,
  banos: 2, precioNoche: 420000, tarifaLimpieza: 70000, calificacion: 4.9, activo: true,
  imagenPrincipal: 'assets/images/cartagena.jpg', imagenes: [],
  servicios: ['Wi-Fi', 'Piscina', 'Aire acondicionado', 'Cocina', 'Parqueadero'], reglas: [],
};

describe('AccommodationCard', () => {
  const crear = async (alojamiento: Accommodation) => {
    await TestBed.configureTestingModule({
      imports: [AccommodationCard],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AccommodationCard);
    fixture.componentRef.setInput('alojamiento', alojamiento);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('muestra nombre, ciudad, tipo, precio y calificación', async () => {
    const html = await crear(base);
    const texto = (html.textContent ?? '').replace(/\s+/g, ' ');
    expect(texto).toContain('Apartamento frente al mar');
    expect(texto).toContain('Cartagena');
    expect(texto).toContain('Apartamento');
    expect(texto).toContain('5 huésp. · 2 hab. · 2 baños');
    expect(texto).toContain('$ 420.000');
    expect(texto).toContain('4.9');
  });

  it('muestra hasta 3 servicios y el resto como +N', async () => {
    const html = await crear(base);
    expect(html.querySelectorAll('.tarjeta__servicio').length).toBe(3);
    expect(html.querySelector('.tarjeta__mas')?.textContent).toBe('+2');
  });

  it('no muestra +N cuando todos los servicios caben', async () => {
    const html = await crear({ ...base, servicios: ['Wi-Fi'] });
    expect(html.querySelector('.tarjeta__mas')).toBeNull();
  });

  it('usa "1 baño" en singular y enlaza al detalle', async () => {
    const html = await crear({ ...base, banos: 1 });
    expect(html.textContent).toContain('1 baño');
    expect(html.querySelector('a')?.getAttribute('href')).toBe('/alojamientos/2');
  });
});

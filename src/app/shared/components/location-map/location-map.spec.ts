import { TestBed } from '@angular/core/testing';
import { LocationMap } from './location-map';

describe('LocationMap', () => {
  const montar = async (ubicacion: string, ciudad: string) => {
    await TestBed.configureTestingModule({ imports: [LocationMap] }).compileComponents();
    const fixture = TestBed.createComponent(LocationMap);
    fixture.componentRef.setInput('ubicacion', ubicacion);
    fixture.componentRef.setInput('ciudad', ciudad);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('incrusta un iframe de Google Maps con la ubicación codificada', async () => {
    const html = await montar('Bocagrande, Cartagena', 'Cartagena');
    const src = html.querySelector('iframe')?.getAttribute('src') ?? '';
    expect(src).toContain('https://www.google.com/maps?q=');
    expect(src).toContain(encodeURIComponent('Bocagrande, Cartagena, Colombia'));
    expect(src).toContain('output=embed');
  });

  it('agrega la ciudad cuando la ubicación no la incluye', async () => {
    const html = await montar('Centro histórico', 'Villa de Leyva');
    const src = html.querySelector('iframe')?.getAttribute('src') ?? '';
    expect(src).toContain(encodeURIComponent('Centro histórico, Villa de Leyva, Colombia'));
  });

  it('el iframe tiene un título descriptivo', async () => {
    const html = await montar('Guatapé, Antioquia', 'Guatapé');
    expect(html.querySelector('iframe')?.getAttribute('title')).toBe('Mapa de Guatapé, Antioquia');
  });
});

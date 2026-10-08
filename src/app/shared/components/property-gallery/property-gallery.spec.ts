import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PropertyGallery } from './property-gallery';

describe('PropertyGallery', () => {
  const montar = async (imagenes: string[], rutaGaleria: unknown[] | null = null) => {
    await TestBed.configureTestingModule({
      imports: [PropertyGallery],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(PropertyGallery);
    fixture.componentRef.setInput('imagenes', imagenes);
    fixture.componentRef.setInput('nombre', 'Cabaña en Guatapé');
    fixture.componentRef.setInput('rutaGaleria', rutaGaleria);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('muestra la foto principal y la secundaria cuando hay dos', async () => {
    const html = await montar(['a.jpg', 'b.jpg']);
    expect(html.querySelectorAll('img').length).toBe(2);
    expect(html.querySelector('.galeria--sola')).toBeNull();
  });

  it('con una sola foto ocupa todo el ancho y no ofrece "Más fotos"', async () => {
    const html = await montar(['a.jpg'], ['/alojamientos', 5, 'galeria']);
    expect(html.querySelectorAll('img').length).toBe(1);
    expect(html.querySelector('.galeria--sola')).toBeTruthy();
    expect(html.querySelector('.galeria__mas')).toBeNull();
  });

  it('con cero fotos muestra el respaldo en lugar de romperse', async () => {
    const html = await montar([]);
    expect(html.querySelectorAll('.galeria__principal').length).toBe(1);
  });

  it('muestra el enlace "Más fotos" hacia la galería cuando se entrega la ruta', async () => {
    const html = await montar(['a.jpg', 'b.jpg'], ['/alojamientos', 3, 'galeria']);
    const enlace = html.querySelector('.galeria__mas');
    expect(enlace?.textContent).toContain('Más fotos');
    expect(enlace?.getAttribute('href')).toBe('/alojamientos/3/galeria');
  });

  it('no muestra "Más fotos" si no se entrega la ruta', async () => {
    const html = await montar(['a.jpg', 'b.jpg']);
    expect(html.querySelector('.galeria__mas')).toBeNull();
  });
});

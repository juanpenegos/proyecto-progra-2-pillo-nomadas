import { TestBed } from '@angular/core/testing';
import { PropertyGallery } from './property-gallery';

describe('PropertyGallery', () => {
  const montar = async (imagenes: string[]) => {
    await TestBed.configureTestingModule({ imports: [PropertyGallery] }).compileComponents();
    const fixture = TestBed.createComponent(PropertyGallery);
    fixture.componentRef.setInput('imagenes', imagenes);
    fixture.componentRef.setInput('nombre', 'Cabaña en Guatapé');
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('muestra la foto principal y la secundaria cuando hay dos', async () => {
    const html = await montar(['a.jpg', 'b.jpg']);
    expect(html.querySelectorAll('img').length).toBe(2);
    expect(html.querySelector('.galeria--sola')).toBeNull();
  });

  it('con una sola foto ocupa todo el ancho', async () => {
    const html = await montar(['a.jpg']);
    expect(html.querySelectorAll('img').length).toBe(1);
    expect(html.querySelector('.galeria--sola')).toBeTruthy();
  });

  it('con cero fotos muestra el respaldo en lugar de romperse', async () => {
    const html = await montar([]);
    expect(html.querySelectorAll('.galeria__principal').length).toBe(1);
  });
});

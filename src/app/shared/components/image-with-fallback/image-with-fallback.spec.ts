import { TestBed } from '@angular/core/testing';
import { ImageWithFallback } from './image-with-fallback';

describe('ImageWithFallback', () => {
  const crear = async (src: string) => {
    await TestBed.configureTestingModule({ imports: [ImageWithFallback] }).compileComponents();
    const fixture = TestBed.createComponent(ImageWithFallback);
    fixture.componentRef.setInput('src', src);
    fixture.componentRef.setInput('alt', 'Foto de prueba');
    await fixture.whenStable();
    return fixture;
  };

  it('muestra la foto recibida', async () => {
    const fixture = await crear('assets/images/loft-bogota.jpg');
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('src')).toBe('assets/images/loft-bogota.jpg');
    expect(img?.getAttribute('alt')).toBe('Foto de prueba');
  });

  it('cambia al placeholder cuando la foto falla', async () => {
    const fixture = await crear('assets/images/no-existe.jpg');
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    img?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(img?.getAttribute('src')).toBe('assets/images/placeholder.svg');
  });
});

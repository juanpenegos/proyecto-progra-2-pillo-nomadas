import { TestBed } from '@angular/core/testing';
import { StarRating } from './star-rating';

describe('StarRating', () => {
  const montar = async (valor: number) => {
    await TestBed.configureTestingModule({ imports: [StarRating] }).compileComponents();
    const fixture = TestBed.createComponent(StarRating);
    fixture.componentRef.setInput('valor', valor);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    return {
      total: html.querySelectorAll('svg').length,
      llenas: html.querySelectorAll('.estrellas__estrella--llena').length,
      etiqueta: html.querySelector('[role="img"]')?.getAttribute('aria-label'),
    };
  };

  it('siempre dibuja 5 estrellas y llena las que corresponden al redondear', async () => {
    expect(await montar(4)).toMatchObject({ total: 5, llenas: 4 });
    TestBed.resetTestingModule();
    expect(await montar(4.7)).toMatchObject({ total: 5, llenas: 5 });
    TestBed.resetTestingModule();
    expect(await montar(0)).toMatchObject({ total: 5, llenas: 0 });
  });

  it('describe la calificación para lectores de pantalla', async () => {
    expect((await montar(4.5)).etiqueta).toBe('4.5 de 5 estrellas');
  });
});

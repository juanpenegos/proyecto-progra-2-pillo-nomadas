import { TestBed } from '@angular/core/testing';
import { Review } from '../../../core/models/review.model';
import { hoyISO } from '../../../core/utils/dates';
import { ReviewCard } from './review-card';

describe('ReviewCard', () => {
  const montar = async (resena: Review) => {
    await TestBed.configureTestingModule({ imports: [ReviewCard] }).compileComponents();
    const fixture = TestBed.createComponent(ReviewCard);
    fixture.componentRef.setInput('resena', resena);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('muestra iniciales, nombre, comentario y estrellas', async () => {
    const html = await montar({
      id: 1, alojamientoId: 1, usuario: 'Laura Gómez', calificacion: 5,
      comentario: 'Excelente ubicación.', fecha: hoyISO(),
    });
    expect(html.querySelector('.resena__avatar')?.textContent).toBe('LG');
    expect(html.querySelector('.resena__usuario')?.textContent).toBe('Laura Gómez');
    expect(html.querySelector('.resena__comentario')?.textContent).toBe('Excelente ubicación.');
    expect(html.querySelector('.resena__fecha')?.textContent).toBe('Hoy');
    expect(html.querySelectorAll('.estrellas__estrella--llena').length).toBe(5);
  });

  it('con un solo nombre usa una sola inicial', async () => {
    const html = await montar({
      id: 2, alojamientoId: 1, usuario: 'carlos', calificacion: 4, comentario: 'Bien.', fecha: '2020-01-01',
    });
    expect(html.querySelector('.resena__avatar')?.textContent).toBe('C');
  });
});

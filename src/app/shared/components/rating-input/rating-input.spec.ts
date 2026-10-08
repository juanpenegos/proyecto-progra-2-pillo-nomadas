import { TestBed } from '@angular/core/testing';
import { RatingInput } from './rating-input';

describe('RatingInput', () => {
  const montar = async (valor: number) => {
    await TestBed.configureTestingModule({ imports: [RatingInput] }).compileComponents();
    const fixture = TestBed.createComponent(RatingInput);
    fixture.componentRef.setInput('valor', valor);
    await fixture.whenStable();
    return { fixture, html: fixture.nativeElement as HTMLElement };
  };

  it('sin valor pide elegir una calificación', async () => {
    const { html } = await montar(0);
    expect(html.textContent).toContain('Selecciona una calificación');
    expect(html.querySelectorAll('.calificar__icono--llena').length).toBe(0);
  });

  it('muestra el valor elegido con su descripción', async () => {
    const { html } = await montar(3);
    expect(html.textContent).toContain('3 de 5 (Bueno)');
    expect(html.querySelectorAll('.calificar__icono--llena').length).toBe(3);
    expect(html.querySelectorAll('[aria-checked="true"]').length).toBe(1);
  });

  it('emite el número de la estrella pulsada', async () => {
    const { fixture, html } = await montar(0);
    const emitidos: number[] = [];
    fixture.componentInstance.valorChange.subscribe((n) => emitidos.push(n));
    html.querySelector<HTMLButtonElement>('[aria-label="4 estrellas"]')!.click();
    expect(emitidos).toEqual([4]);
  });
});

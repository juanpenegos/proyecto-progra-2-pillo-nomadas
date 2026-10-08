import { TestBed } from '@angular/core/testing';
import { CriteriosBusqueda, HomeHero } from './home-hero';

describe('HomeHero', () => {
  const montar = async () => {
    await TestBed.configureTestingModule({ imports: [HomeHero] }).compileComponents();
    const fixture = TestBed.createComponent(HomeHero);
    fixture.componentRef.setInput('ciudades', ['Bogotá', 'Cartagena']);
    fixture.componentRef.setInput('opcionesHuespedes', [1, 2, 3]);
    await fixture.whenStable();
    const emitidos: CriteriosBusqueda[] = [];
    fixture.componentInstance.buscar.subscribe((c) => emitidos.push(c));
    return { fixture, emitidos, html: fixture.nativeElement as HTMLElement };
  };

  const elegir = (html: HTMLElement, id: string, indice: number) => {
    const select = html.querySelector<HTMLSelectElement>(id)!;
    select.selectedIndex = indice;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const buscar = async (fixture: { whenStable: () => Promise<unknown>; detectChanges: () => void }, html: HTMLElement) => {
    html.querySelector<HTMLButtonElement>('.buscador__boton')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const mensaje = (html: HTMLElement) => html.querySelector('.buscador__error')?.textContent?.trim();

  it('no muestra ningún mensaje antes de intentar buscar', async () => {
    const { html } = await montar();
    expect(mensaje(html)).toBe('');
  });

  it('con los dos campos vacíos no busca y pide ambos datos', async () => {
    const { fixture, emitidos, html } = await montar();
    await buscar(fixture, html);
    expect(emitidos).toEqual([]);
    expect(mensaje(html)).toBe('Elige a dónde vas y cuántos huéspedes serán para buscar.');
    expect(html.querySelector('#buscador-ciudad')?.getAttribute('aria-invalid')).toBe('true');
    expect(html.querySelector('#buscador-huespedes')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('si solo falta el destino, lo pide y no busca', async () => {
    const { fixture, emitidos, html } = await montar();
    elegir(html, '#buscador-huespedes', 2); // "2 huéspedes"
    await buscar(fixture, html);
    expect(emitidos).toEqual([]);
    expect(mensaje(html)).toBe('Elige a dónde vas para buscar.');
  });

  it('si solo faltan los huéspedes, los pide y no busca', async () => {
    const { fixture, emitidos, html } = await montar();
    elegir(html, '#buscador-ciudad', 1); // "Bogotá"
    await buscar(fixture, html);
    expect(emitidos).toEqual([]);
    expect(mensaje(html)).toBe('Elige cuántos huéspedes serán para buscar.');
  });

  it('con destino y huéspedes emite la búsqueda y no muestra errores', async () => {
    const { fixture, emitidos, html } = await montar();
    elegir(html, '#buscador-ciudad', 2); // "Cartagena"
    elegir(html, '#buscador-huespedes', 3); // "3 huéspedes"
    await buscar(fixture, html);
    expect(emitidos).toEqual([{ ciudad: 'Cartagena', huespedes: 3 }]);
    expect(mensaje(html)).toBe('');
  });
});

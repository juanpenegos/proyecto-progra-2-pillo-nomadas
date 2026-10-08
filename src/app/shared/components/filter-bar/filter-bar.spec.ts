import { TestBed } from '@angular/core/testing';
import { FILTROS_VACIOS } from '../../../core/models/search-filters.model';
import { ExploreCriteria } from '../../../core/utils/filter-params';
import { FilterBar } from './filter-bar';

describe('FilterBar', () => {
  const crear = async (entradas: Record<string, unknown> = {}) => {
    await TestBed.configureTestingModule({ imports: [FilterBar] }).compileComponents();
    const fixture = TestBed.createComponent(FilterBar);
    fixture.componentRef.setInput('ciudades', ['Bogotá', 'Cartagena']);
    fixture.componentRef.setInput('tipos', ['Apartamento', 'Casa']);
    fixture.componentRef.setInput('opcionesHuespedes', [1, 2, 3]);
    for (const [clave, valor] of Object.entries(entradas)) {
      fixture.componentRef.setInput(clave, valor);
    }
    await fixture.whenStable();
    return { fixture, html: fixture.nativeElement as HTMLElement };
  };

  it('emite los criterios cuando el usuario cambia un filtro', async () => {
    const { fixture, html } = await crear();
    const emitidos: ExploreCriteria[] = [];
    fixture.componentInstance.cambio.subscribe((c) => emitidos.push(c));

    const ciudad = html.querySelector<HTMLSelectElement>('#filtro-ciudad')!;
    ciudad.value = 'Cartagena';
    ciudad.dispatchEvent(new Event('change', { bubbles: true }));

    expect(emitidos.length).toBe(1);
    expect(emitidos[0].filtros.ciudad).toBe('Cartagena');
    expect(emitidos[0].orden).toBe('mejor-valorados');
  });

  it('muestra los filtros recibidos en los campos', async () => {
    const { html } = await crear({
      filtros: { ciudad: 'Bogotá', huespedes: 2, tipo: 'Casa', precioMax: 300000 },
      orden: 'menor-precio',
    });
    expect(html.querySelector<HTMLSelectElement>('#filtro-ciudad')!.value).toBe('Bogotá');
    expect(html.querySelector<HTMLSelectElement>('#filtro-tipo')!.value).toBe('Casa');
    expect(html.querySelector<HTMLInputElement>('#filtro-precio')!.value).toBe('300000');
    expect(html.querySelector<HTMLSelectElement>('#filtro-orden')!.value).toBe('menor-precio');
  });

  it('el botón limpiar está deshabilitado sin filtros y habilitado con filtros', async () => {
    const sin = await crear();
    expect(sin.html.querySelector<HTMLButtonElement>('.filtros__limpiar')!.disabled).toBe(true);
    TestBed.resetTestingModule();

    const con = await crear({ filtros: { ...FILTROS_VACIOS, tipo: 'Casa' } });
    const boton = con.html.querySelector<HTMLButtonElement>('.filtros__limpiar')!;
    expect(boton.disabled).toBe(false);

    let veces = 0;
    con.fixture.componentInstance.limpiar.subscribe(() => veces++);
    boton.click();
    expect(veces).toBe(1);
  });

  it('con un precio máximo inválido muestra el error y no emite', async () => {
    const { fixture, html } = await crear();
    const emitidos: ExploreCriteria[] = [];
    fixture.componentInstance.cambio.subscribe((c) => emitidos.push(c));

    const precio = html.querySelector<HTMLInputElement>('#filtro-precio')!;
    precio.value = '0';
    precio.dispatchEvent(new Event('input', { bubbles: true }));
    precio.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    expect(emitidos.length).toBe(0);
    expect(html.querySelector('[role="alert"]')?.textContent).toContain('mayor a 0');
  });

  it('si la URL trae una ciudad que no está en la lista, igual la muestra seleccionada', async () => {
    const { html } = await crear({ filtros: { ...FILTROS_VACIOS, ciudad: 'Cali' } });
    expect(html.querySelector<HTMLSelectElement>('#filtro-ciudad')!.value).toBe('Cali');
  });
});

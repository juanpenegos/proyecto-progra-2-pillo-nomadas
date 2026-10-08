import { TestBed } from '@angular/core/testing';
import { Accommodation } from '../../../core/models/accommodation.model';
import { Quote } from '../../../core/models/quote.model';
import { QuoteInput } from '../../../core/validators/quote-validators';
import { QuoteCard } from './quote-card';

const alojamiento: Accommodation = {
  id: 3, nombre: 'Cabaña en Guatapé', descripcion: '', ciudad: 'Guatapé', ubicacion: 'Guatapé, Antioquia',
  tipo: 'Cabaña', capacidad: 3, habitaciones: 3, camas: 4, banos: 2, precioNoche: 350000, tarifaLimpieza: 60000,
  calificacion: 4.7, activo: true, imagenPrincipal: '', imagenes: [], servicios: [], reglas: [],
};

const cotizacion: Quote = {
  llegada: '2026-10-10', salida: '2026-10-12', huespedes: 2, noches: 2, precioNoche: 350000,
  subtotal: 700000, tarifaLimpieza: 60000, tarifaServicio: 70000, total: 830000,
};

describe('QuoteCard', () => {
  const montar = async (entradas: Record<string, unknown> = {}) => {
    await TestBed.configureTestingModule({ imports: [QuoteCard] }).compileComponents();
    const fixture = TestBed.createComponent(QuoteCard);
    fixture.componentRef.setInput('alojamiento', alojamiento);
    for (const [clave, valor] of Object.entries(entradas)) {
      fixture.componentRef.setInput(clave, valor);
    }
    await fixture.whenStable();
    return { fixture, html: fixture.nativeElement as HTMLElement };
  };

  const clic = async (fixture: { whenStable: () => Promise<unknown>; detectChanges: () => void }, el: Element | null) => {
    (el as HTMLElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('muestra el precio por noche y el máximo de huéspedes', async () => {
    const { html } = await montar();
    expect((html.textContent ?? '').replace(/\s/g, ' ')).toContain('$ 350.000');
    expect(html.textContent).toContain('Huéspedes (máx. 3)');
  });

  it('los botones de huéspedes respetan el mínimo de 1 y la capacidad', async () => {
    const { fixture, html } = await montar();
    const quitar = html.querySelector<HTMLButtonElement>('[aria-label="Quitar un huésped"]')!;
    const agregar = html.querySelector<HTMLButtonElement>('[aria-label="Agregar un huésped"]')!;
    expect(quitar.disabled).toBe(true); // empieza en 1

    await clic(fixture, agregar);
    await clic(fixture, agregar);
    expect(html.querySelector('.cotizar__cantidad')?.textContent).toBe('3');
    expect(agregar.disabled).toBe(true); // llegó a la capacidad (3)

    await clic(fixture, quitar);
    expect(html.querySelector('.cotizar__cantidad')?.textContent).toBe('2');
  });

  it('emite calcular con las fechas y los huéspedes elegidos', async () => {
    const { fixture, html } = await montar();
    const emitidos: QuoteInput[] = [];
    fixture.componentInstance.calcular.subscribe((e) => emitidos.push(e));

    const llegada = html.querySelector<HTMLInputElement>('#cotizar-llegada')!;
    llegada.value = '2026-10-10';
    llegada.dispatchEvent(new Event('input', { bubbles: true }));
    const salida = html.querySelector<HTMLInputElement>('#cotizar-salida')!;
    salida.value = '2026-10-12';
    salida.dispatchEvent(new Event('input', { bubbles: true }));
    await clic(fixture, html.querySelector('.cotizar__boton'));

    expect(emitidos).toEqual([{ llegada: '2026-10-10', salida: '2026-10-12', huespedes: 1 }]);
  });

  it('avisa con "cambio" cuando el usuario modifica algo (invalida la cotización)', async () => {
    const { fixture, html } = await montar();
    let veces = 0;
    fixture.componentInstance.cambio.subscribe(() => veces++);
    await clic(fixture, html.querySelector('[aria-label="Agregar un huésped"]'));
    expect(veces).toBe(1);
  });

  it('muestra los errores recibidos junto a cada campo', async () => {
    const { html } = await montar({
      errores: { llegada: 'Selecciona la fecha de llegada', salida: 'Selecciona la fecha de salida' },
    });
    expect(html.querySelector('#cotizar-llegada-error')?.textContent).toContain('Selecciona la fecha de llegada');
    expect(html.querySelector('#cotizar-salida-error')?.textContent).toContain('Selecciona la fecha de salida');
    expect(html.querySelector('#cotizar-llegada')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('con cotización muestra el resumen y el botón Reservar en lugar de Calcular', async () => {
    const { fixture, html } = await montar({ cotizacion });
    expect(html.querySelector('app-quote-summary')).toBeTruthy();
    expect(html.textContent).not.toContain('Calcular cotización');

    let veces = 0;
    fixture.componentInstance.reservar.subscribe(() => veces++);
    const reservar = Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes('Reservar'));
    reservar!.click();
    expect(veces).toBe(1);
  });

  it('oculta Reservar mientras el formulario de contacto está abierto', async () => {
    const { html } = await montar({ cotizacion, reservando: true });
    const botones = Array.from(html.querySelectorAll('button')).map((b) => b.textContent?.trim());
    expect(botones).not.toContain('Reservar');
  });
});

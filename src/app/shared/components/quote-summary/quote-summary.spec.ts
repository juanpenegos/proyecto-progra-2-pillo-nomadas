import { TestBed } from '@angular/core/testing';
import { Quote } from '../../../core/models/quote.model';
import { QuoteSummary } from './quote-summary';

const cotizacion: Quote = {
  llegada: '2026-10-10', salida: '2026-10-23', huespedes: 2, noches: 13, precioNoche: 350000,
  subtotal: 4550000, tarifaLimpieza: 60000, tarifaServicio: 455000, total: 5065000,
};

describe('QuoteSummary', () => {
  it('muestra el desglose completo de la cotización', async () => {
    await TestBed.configureTestingModule({ imports: [QuoteSummary] }).compileComponents();
    const fixture = TestBed.createComponent(QuoteSummary);
    fixture.componentRef.setInput('cotizacion', cotizacion);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    const filas = Array.from(html.querySelectorAll('.resumen__fila')).map((fila) => ({
      // Intl usa un espacio duro después del $; se normaliza para comparar.
      nombre: fila.querySelector('dt')?.textContent?.trim().replace(/\s/g, ' '),
      valor: fila.querySelector('dd')?.textContent?.trim().replace(/\s/g, ' '),
    }));

    expect(html.textContent).toContain('Cotización generada');
    expect(filas).toEqual([
      { nombre: '$ 350.000 × 13 noches', valor: '$ 4.550.000' },
      { nombre: 'Tarifa de limpieza', valor: '$ 60.000' },
      { nombre: 'Tarifa de servicio (10%)', valor: '$ 455.000' },
      { nombre: 'Total', valor: '$ 5.065.000' },
    ]);
  });

  it('usa "1 noche" en singular', async () => {
    await TestBed.configureTestingModule({ imports: [QuoteSummary] }).compileComponents();
    const fixture = TestBed.createComponent(QuoteSummary);
    fixture.componentRef.setInput('cotizacion', { ...cotizacion, noches: 1 });
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('× 1 noche');
  });
});

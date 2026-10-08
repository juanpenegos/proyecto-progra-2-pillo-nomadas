import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('muestra el mensaje y emite la acción al pulsar el botón', async () => {
    await TestBed.configureTestingModule({ imports: [EmptyState] }).compileComponents();
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('titulo', 'Sin resultados.');
    fixture.componentRef.setInput('mensaje', 'Intenta con otros filtros.');
    fixture.componentRef.setInput('textoBoton', 'Explorar alojamientos');
    await fixture.whenStable();

    let veces = 0;
    fixture.componentInstance.accion.subscribe(() => veces++);
    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Sin resultados.');
    expect(html.textContent).toContain('Intenta con otros filtros.');

    html.querySelector<HTMLButtonElement>('button')?.click();
    expect(veces).toBe(1);
  });
});

import { TestBed } from '@angular/core/testing';
import { ContactForm, DatosContacto } from './contact-form';

describe('ContactForm', () => {
  const montar = async () => {
    await TestBed.configureTestingModule({ imports: [ContactForm] }).compileComponents();
    const fixture = TestBed.createComponent(ContactForm);
    await fixture.whenStable();
    return { fixture, html: fixture.nativeElement as HTMLElement };
  };

  const escribir = (html: HTMLElement, id: string, valor: string) => {
    const campo = html.querySelector<HTMLInputElement>(id)!;
    campo.value = valor;
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const enviar = async (fixture: { whenStable: () => Promise<unknown>; detectChanges: () => void }, html: HTMLElement) => {
    html.querySelector<HTMLButtonElement>('.contacto__confirmar')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('al enviar vacío muestra los dos errores y no emite', async () => {
    const { fixture, html } = await montar();
    const emitidos: DatosContacto[] = [];
    fixture.componentInstance.confirmar.subscribe((d) => emitidos.push(d));

    await enviar(fixture, html);

    const texto = html.textContent ?? '';
    expect(texto).toContain('Ingresa tu nombre completo');
    expect(texto).toContain('Ingresa un correo electrónico válido');
    expect(emitidos.length).toBe(0);
  });

  it('con un correo mal escrito solo marca el correo', async () => {
    const { fixture, html } = await montar();
    escribir(html, '#contacto-nombre', 'Ana Pérez');
    escribir(html, '#contacto-correo', 'ana@correo');
    await enviar(fixture, html);

    const texto = html.textContent ?? '';
    expect(texto).not.toContain('Ingresa tu nombre completo');
    expect(texto).toContain('Ingresa un correo electrónico válido');
    expect(html.querySelector('#contacto-correo')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('con datos válidos emite nombre y correo sin espacios sobrantes', async () => {
    const { fixture, html } = await montar();
    const emitidos: DatosContacto[] = [];
    fixture.componentInstance.confirmar.subscribe((d) => emitidos.push(d));

    escribir(html, '#contacto-nombre', '  Ana Pérez ');
    escribir(html, '#contacto-correo', ' ana@correo.com ');
    await enviar(fixture, html);

    expect(emitidos).toEqual([{ nombre: 'Ana Pérez', correo: 'ana@correo.com' }]);
  });

  it('el enlace Cancelar emite el evento cancelar', async () => {
    const { fixture, html } = await montar();
    let veces = 0;
    fixture.componentInstance.cancelar.subscribe(() => veces++);
    html.querySelector<HTMLButtonElement>('.contacto__cancelar')!.click();
    expect(veces).toBe(1);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavLink } from '../../../core/models/nav-link.model';
import { Navbar } from './navbar';

const enlaces: NavLink[] = [
  { texto: 'Inicio', ruta: '/', icono: 'inicio', exacto: true },
  { texto: 'Explorar', ruta: '/explorar', icono: 'explorar', exacto: false },
];

describe('Navbar', () => {
  const crear = async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Navbar);
    fixture.componentRef.setInput('enlaces', enlaces);
    await fixture.whenStable();
    return fixture;
  };

  it('muestra un enlace por cada elemento recibido', async () => {
    const fixture = await crear();
    const textos = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.navbar__enlace'),
    ).map((a) => a.textContent?.trim());
    expect(textos).toEqual(['Inicio', 'Explorar']);
  });

  it('abre y cierra el menú móvil', async () => {
    const fixture = await crear();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('.menu-movil')).toBeNull();

    html.querySelector<HTMLButtonElement>('.navbar__hamburguesa')?.click();
    await fixture.whenStable();
    expect(html.querySelector('.menu-movil')).toBeTruthy();

    html.querySelector<HTMLButtonElement>('.menu-movil__cerrar')?.click();
    await fixture.whenStable();
    expect(html.querySelector('.menu-movil')).toBeNull();
  });

  it('cierra el menú con la tecla Escape', async () => {
    const fixture = await crear();
    const html = fixture.nativeElement as HTMLElement;
    html.querySelector<HTMLButtonElement>('.navbar__hamburguesa')?.click();
    await fixture.whenStable();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(html.querySelector('.menu-movil')).toBeNull();
  });
});

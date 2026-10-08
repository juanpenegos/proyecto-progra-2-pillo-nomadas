import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavLink } from '../../../core/models/nav-link.model';
import { MobileMenu } from './mobile-menu';

const enlaces: NavLink[] = [
  { texto: 'Inicio', ruta: '/', icono: 'inicio', exacto: true },
  { texto: 'Mis reservas', ruta: '/mis-reservas', icono: 'reservas', exacto: false },
];

describe('MobileMenu', () => {
  const crear = async () => {
    await TestBed.configureTestingModule({
      imports: [MobileMenu],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(MobileMenu);
    fixture.componentRef.setInput('enlaces', enlaces);
    await fixture.whenStable();
    return fixture;
  };

  it('lista las opciones recibidas', async () => {
    const fixture = await crear();
    const textos = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.menu-movil__texto'),
    ).map((e) => e.textContent?.trim());
    expect(textos).toEqual(['Inicio', 'Mis reservas']);
  });

  it('emite cerrar al pulsar el botón de cerrar o el fondo oscuro', async () => {
    const fixture = await crear();
    let veces = 0;
    fixture.componentInstance.cerrar.subscribe(() => veces++);
    const html = fixture.nativeElement as HTMLElement;

    html.querySelector<HTMLButtonElement>('.menu-movil__cerrar')?.click();
    html.querySelector<HTMLElement>('.menu-movil__velo')?.click();
    expect(veces).toBe(2);
  });
});

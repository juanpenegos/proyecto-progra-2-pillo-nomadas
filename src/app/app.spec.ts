import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('muestra la barra de navegación, el contenido principal y el pie', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('app-navbar')).toBeTruthy();
    expect(html.querySelector('main')).toBeTruthy();
    expect(html.querySelector('app-footer')).toBeTruthy();
  });
});

@Component({ selector: 'app-pagina-de-prueba', template: '<p>Contenido</p>' })
class PaginaDePrueba {}

describe('App: pantallas a pantalla completa', () => {
  const montar = async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: PaginaDePrueba },
          { path: 'completa', component: PaginaDePrueba, data: { sinMarco: true } },
        ]),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    return { fixture, router, html: fixture.nativeElement as HTMLElement };
  };

  const ir = async (fixture: { whenStable: () => Promise<unknown>; detectChanges: () => void }, router: Router, url: string) => {
    await router.navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
  };

  it('muestra la barra de navegación y el pie en las pantallas normales', async () => {
    const { fixture, router, html } = await montar();
    await ir(fixture, router, '/');
    expect(html.querySelector('app-navbar')).toBeTruthy();
    expect(html.querySelector('app-footer')).toBeTruthy();
  });

  it('oculta la barra y el pie en una ruta que pide pantalla completa, y los recupera al salir', async () => {
    const { fixture, router, html } = await montar();
    await ir(fixture, router, '/completa');
    expect(html.querySelector('app-navbar')).toBeNull();
    expect(html.querySelector('app-footer')).toBeNull();
    expect(html.querySelector('main')).toBeTruthy();

    await ir(fixture, router, '/');
    expect(html.querySelector('app-navbar')).toBeTruthy();
    expect(html.querySelector('app-footer')).toBeTruthy();
  });
});

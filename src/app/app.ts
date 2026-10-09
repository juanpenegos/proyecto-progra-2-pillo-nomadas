import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NavLink } from './core/models/nav-link.model';
import { Footer } from './shared/components/footer/footer';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  /** false en las pantallas que se muestran a pantalla completa (la galería). */
  protected readonly conMarco = signal(true);

  protected readonly enlaces: NavLink[] = [
    { texto: 'Inicio', ruta: '/', icono: 'inicio', exacto: true },
    { texto: 'Explorar', ruta: '/explorar', icono: 'explorar', exacto: false },
    { texto: 'Mis reservas', ruta: '/mis-reservas', icono: 'reservas', exacto: false },
  ];

  constructor(private readonly router: Router) {
    // Cada vez que termina una navegación se revisa si la ruta pide mostrarse sin barra ni pie.
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => this.conMarco.set(!this.pideSinMarco()));
  }

  private pideSinMarco(): boolean {
    let ruta = this.router.routerState.snapshot.root;
    while (ruta.firstChild) {
      ruta = ruta.firstChild;
    }
    return ruta.data['sinMarco'] === true;
  }
}

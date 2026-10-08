import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
  protected readonly enlaces: NavLink[] = [
    { texto: 'Inicio', ruta: '/', icono: 'inicio', exacto: true },
    { texto: 'Explorar', ruta: '/explorar', icono: 'explorar', exacto: false },
    { texto: 'Mis reservas', ruta: '/mis-reservas', icono: 'reservas', exacto: false },
  ];
}

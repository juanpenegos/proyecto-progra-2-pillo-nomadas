import { Component, ElementRef, Input, ViewChild, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavLink } from '../../../core/models/nav-link.model';
import { MobileMenu } from '../mobile-menu/mobile-menu';

/** Componente "tonto": recibe los enlaces y solo maneja si el menú móvil está abierto. */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MobileMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Input() enlaces: NavLink[] = [];

  @ViewChild('hamburguesa') private hamburguesa?: ElementRef<HTMLButtonElement>;

  protected readonly menuAbierto = signal(false);

  protected abrirMenu(): void {
    this.menuAbierto.set(true);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
    this.hamburguesa?.nativeElement.focus();
  }
}

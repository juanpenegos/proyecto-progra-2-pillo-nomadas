import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavLink } from '../../../core/models/nav-link.model';

/** Panel lateral del móvil. Componente "tonto": recibe los enlaces y avisa cuando debe cerrarse. */
@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.css',
})
export class MobileMenu {
  @Input() enlaces: NavLink[] = [];
  @Output() cerrar = new EventEmitter<void>();

  /** Al aparecer el botón de cerrar recibe el foco, así el teclado queda dentro del menú. */
  @ViewChild('botonCerrar') set botonCerrar(boton: ElementRef<HTMLButtonElement> | undefined) {
    boton?.nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  protected alPulsarEscape(): void {
    this.cerrar.emit();
  }
}

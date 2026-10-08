import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface CriteriosBusqueda {
  ciudad: string;
  huespedes: number | null;
}

/** Portada del inicio con el buscador. Recibe las opciones y avisa qué eligió el usuario. */
@Component({
  selector: 'app-home-hero',
  imports: [ReactiveFormsModule],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.css',
})
export class HomeHero {
  @Input() ciudades: string[] = [];
  @Input() opcionesHuespedes: number[] = [];
  @Output() buscar = new EventEmitter<CriteriosBusqueda>();

  /** Si falta hero.jpg, se queda el fondo verde oscuro y el diseño no se rompe. */
  protected readonly fotoFallo = signal(false);

  protected readonly busqueda = new FormGroup({
    ciudad: new FormControl('', { nonNullable: true }),
    huespedes: new FormControl<number | null>(null),
  });

  protected enviar(): void {
    this.buscar.emit(this.busqueda.getRawValue());
  }
}

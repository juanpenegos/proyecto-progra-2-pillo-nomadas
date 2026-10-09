import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Barra superior de la galería a pantalla completa: enlace "Volver" y nombre del alojamiento. */
@Component({
  selector: 'app-gallery-bar',
  imports: [RouterLink],
  templateUrl: './gallery-bar.html',
  styleUrl: './gallery-bar.css',
})
export class GalleryBar {
  @Input({ required: true }) nombre = '';
  /** Ruta a la que lleva "Volver" (el detalle del alojamiento). */
  @Input({ required: true }) ruta: unknown[] = [];
}

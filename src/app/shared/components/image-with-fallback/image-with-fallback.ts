import { Component, Input, OnChanges } from '@angular/core';

/**
 * Imagen que nunca se rompe: si la foto no carga, muestra placeholder.svg
 * y conserva el tamaño del contenedor para que el diseño no se mueva.
 */
@Component({
  selector: 'app-image-with-fallback',
  templateUrl: './image-with-fallback.html',
  styleUrl: './image-with-fallback.css',
})
export class ImageWithFallback implements OnChanges {
  @Input({ required: true }) src = '';
  @Input() alt = '';

  protected readonly respaldo = 'assets/images/placeholder.svg';
  protected fallo = false;

  /** Si cambia la ruta recibida, se vuelve a intentar con la foto original. */
  ngOnChanges(): void {
    this.fallo = false;
  }

  /** Evento `error` del <img>: cambia al placeholder (una sola vez, para no entrar en bucle). */
  protected alFallar(): void {
    this.fallo = true;
  }
}

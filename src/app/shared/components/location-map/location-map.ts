import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Mapa incrustado de Google sin clave de API. Angular bloquea por seguridad las URLs externas
 * dentro de un iframe; por eso la URL se marca como segura con DomSanitizer, sabiendo que se
 * construye solo con la ubicación del alojamiento (codificada) y un dominio fijo.
 */
@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.html',
  styleUrl: './location-map.css',
})
export class LocationMap {
  @Input({ required: true }) ubicacion = '';
  @Input({ required: true }) ciudad = '';

  /** Sin internet no tiene sentido pedir el mapa: se muestra el recuadro con un mensaje. */
  protected readonly enLinea = typeof navigator === 'undefined' ? true : navigator.onLine;

  constructor(private readonly sanitizer: DomSanitizer) {}

  /** "Centro histórico" solo no basta: se le agrega la ciudad y el país para ubicarlo bien. */
  private get consulta(): string {
    const lugar = this.ubicacion.includes(this.ciudad) ? this.ubicacion : `${this.ubicacion}, ${this.ciudad}`;
    return `${lugar}, Colombia`;
  }

  protected get url(): SafeResourceUrl {
    const direccion = `https://www.google.com/maps?q=${encodeURIComponent(this.consulta)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(direccion);
  }
}

import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageWithFallback } from '../image-with-fallback/image-with-fallback';

/** Foto principal y, si existe, una foto secundaria con un enlace "Más fotos" a la galería completa. */
@Component({
  selector: 'app-property-gallery',
  imports: [RouterLink, ImageWithFallback],
  templateUrl: './property-gallery.html',
  styleUrl: './property-gallery.css',
})
export class PropertyGallery {
  @Input({ required: true }) imagenes: string[] = [];
  @Input({ required: true }) nombre = '';
  /** Ruta de la galería completa; si no se entrega, no se muestra el enlace. */
  @Input() rutaGaleria: unknown[] | null = null;
}

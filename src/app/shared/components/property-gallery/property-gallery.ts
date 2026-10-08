import { Component, Input } from '@angular/core';
import { ImageWithFallback } from '../image-with-fallback/image-with-fallback';

/** Foto principal y, si existe, una foto secundaria. */
@Component({
  selector: 'app-property-gallery',
  imports: [ImageWithFallback],
  templateUrl: './property-gallery.html',
  styleUrl: './property-gallery.css',
})
export class PropertyGallery {
  @Input({ required: true }) imagenes: string[] = [];
  @Input({ required: true }) nombre = '';
}

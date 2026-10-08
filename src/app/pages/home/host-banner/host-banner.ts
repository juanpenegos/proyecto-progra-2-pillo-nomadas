import { Component } from '@angular/core';
import { ImageWithFallback } from '../../../shared/components/image-with-fallback/image-with-fallback';

/** Bloque estático "¿Tienes un espacio para compartir?" del inicio. */
@Component({
  selector: 'app-host-banner',
  imports: [ImageWithFallback],
  templateUrl: './host-banner.html',
  styleUrl: './host-banner.css',
})
export class HostBanner {}

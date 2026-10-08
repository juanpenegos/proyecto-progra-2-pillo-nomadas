import { Component, Input } from '@angular/core';

/** Encabezado verde con onda. El botón de acción (opcional) se pasa como contenido. */
@Component({
  selector: 'app-page-banner',
  templateUrl: './page-banner.html',
  styleUrl: './page-banner.css',
})
export class PageBanner {
  @Input({ required: true }) titulo = '';
  @Input() subtitulo = '';
}

import { Component, Input } from '@angular/core';

/** Lista con ícono: "check" para servicios y "alerta" para reglas. */
@Component({
  selector: 'app-info-list',
  templateUrl: './info-list.html',
  styleUrl: './info-list.css',
})
export class InfoList {
  @Input({ required: true }) elementos: string[] = [];
  @Input() tipo: 'check' | 'alerta' = 'check';
  @Input() etiqueta = '';
}

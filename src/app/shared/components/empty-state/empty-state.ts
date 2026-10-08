import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Estado vacío: explica por qué no hay nada y ofrece la acción que lo resuelve. */
@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
})
export class EmptyState {
  @Input({ required: true }) titulo = '';
  @Input({ required: true }) mensaje = '';
  @Input({ required: true }) textoBoton = '';
  @Output() accion = new EventEmitter<void>();
}

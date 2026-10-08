import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
})
export class ErrorState {
  @Input() titulo = 'No pudimos cargar la información';
  @Input() mensaje = 'Revisa tu conexión e inténtalo de nuevo.';
  @Output() reintentar = new EventEmitter<void>();
}

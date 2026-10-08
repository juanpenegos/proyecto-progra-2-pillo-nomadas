import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchFilters, SortOrder, FILTROS_VACIOS } from '../../../core/models/search-filters.model';
import { ExploreCriteria, ORDEN_POR_DEFECTO, hayFiltrosActivos } from '../../../core/utils/filter-params';

/**
 * Barra de filtros. Componente "tonto": muestra los criterios que recibe y avisa cuando
 * el usuario los cambia; quien decide qué hacer con ellos es la página.
 */
@Component({
  selector: 'app-filter-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBar implements OnChanges {
  @Input() filtros: SearchFilters = FILTROS_VACIOS;
  @Input() orden: SortOrder = ORDEN_POR_DEFECTO;
  @Input() ciudades: string[] = [];
  @Input() tipos: string[] = [];
  @Input() opcionesHuespedes: number[] = [];

  @Output() cambio = new EventEmitter<ExploreCriteria>();
  @Output() limpiar = new EventEmitter<void>();

  protected readonly formulario = new FormGroup({
    ciudad: new FormControl('', { nonNullable: true }),
    huespedes: new FormControl<number | null>(null),
    tipo: new FormControl('', { nonNullable: true }),
    precioMax: new FormControl<number | null>(null, [Validators.min(1)]),
    orden: new FormControl<SortOrder>(ORDEN_POR_DEFECTO, { nonNullable: true }),
  });

  /** Mantiene el formulario igual a lo que dice la URL (por ejemplo, al limpiar o volver atrás). */
  ngOnChanges(): void {
    this.formulario.setValue(
      { ...this.filtros, orden: this.orden },
      { emitEvent: false },
    );
  }

  /** Si la URL trae una ciudad que no está en la lista, se agrega para que el selector no quede en blanco. */
  protected get ciudadesVisibles(): string[] {
    return this.conValorActual(this.ciudades, this.filtros.ciudad);
  }

  protected get tiposVisibles(): string[] {
    return this.conValorActual(this.tipos, this.filtros.tipo);
  }

  private conValorActual(opciones: string[], actual: string): string[] {
    return actual === '' || opciones.includes(actual) ? opciones : [...opciones, actual];
  }

  protected get hayFiltros(): boolean {
    return hayFiltrosActivos(this.filtros);
  }

  protected emitir(): void {
    if (this.formulario.invalid) {
      return; // el mensaje de error ya se muestra junto al campo
    }
    const { orden, ...filtros } = this.formulario.getRawValue();
    this.cambio.emit({ filtros, orden });
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface CriteriosBusqueda {
  ciudad: string;
  huespedes: number | null;
}

/** Portada del inicio con el buscador. Recibe las opciones y avisa qué eligió el usuario. */
@Component({
  selector: 'app-home-hero',
  imports: [ReactiveFormsModule],
  templateUrl: './home-hero.html',
  styleUrl: './home-hero.css',
})
export class HomeHero {
  @Input() ciudades: string[] = [];
  @Input() opcionesHuespedes: number[] = [];
  @Output() buscar = new EventEmitter<CriteriosBusqueda>();

  /** Para buscar hay que llenar primero el destino y los huéspedes. */
  protected readonly busqueda = new FormGroup({
    ciudad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    huespedes: new FormControl<number | null>(null, [Validators.required]),
  });

  protected enviar(): void {
    if (this.busqueda.invalid) {
      this.busqueda.markAllAsTouched(); // así aparece el mensaje de lo que falta
      return;
    }
    this.buscar.emit(this.busqueda.getRawValue());
  }

  /** El campo se marca solo después de que el usuario lo tocó o intentó buscar. */
  protected faltante(campo: 'ciudad' | 'huespedes'): boolean {
    const control = this.busqueda.controls[campo];
    return control.invalid && control.touched;
  }

  /** Mensaje específico según lo que falte, para decir cómo corregirlo. */
  protected get mensajeError(): string {
    const sinCiudad = this.faltante('ciudad');
    const sinHuespedes = this.faltante('huespedes');
    if (sinCiudad && sinHuespedes) {
      return 'Elige a dónde vas y cuántos huéspedes serán para buscar.';
    }
    if (sinCiudad) {
      return 'Elige a dónde vas para buscar.';
    }
    return sinHuespedes ? 'Elige cuántos huéspedes serán para buscar.' : '';
  }
}

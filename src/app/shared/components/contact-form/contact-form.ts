import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { correoValido, nombreValido } from '../../../core/validators/quote-validators';

export interface DatosContacto {
  nombre: string;
  correo: string;
}

const validarNombre = (control: AbstractControl<string>): ValidationErrors | null =>
  nombreValido(control.value) ? null : { nombre: true };

const validarCorreo = (control: AbstractControl<string>): ValidationErrors | null =>
  correoValido(control.value) ? null : { correo: true };

/** Formulario de datos de contacto. Componente "tonto": avisa con eventos, no guarda nada. */
@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  @Output() confirmar = new EventEmitter<DatosContacto>();
  @Output() cancelar = new EventEmitter<void>();

  protected readonly formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [validarNombre] }),
    correo: new FormControl('', { nonNullable: true, validators: [validarCorreo] }),
  });

  protected enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); // así aparecen los mensajes de los campos pendientes
      return;
    }
    const { nombre, correo } = this.formulario.getRawValue();
    this.confirmar.emit({ nombre: nombre.trim(), correo: correo.trim() });
  }

  /** El error solo se muestra después de que el usuario tocó el campo o intentó enviar. */
  protected invalido(campo: 'nombre' | 'correo'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }
}

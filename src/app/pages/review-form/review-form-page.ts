import { Component, OnInit, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Accommodation } from '../../core/models/accommodation.model';
import { AccommodationService } from '../../core/services/accommodation.service';
import { BookingService } from '../../core/services/booking.service';
import { ReviewService } from '../../core/services/review.service';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingIndicator } from '../../shared/components/loading-indicator/loading-indicator';
import { RatingInput } from '../../shared/components/rating-input/rating-input';
import { NotFoundPage } from '../not-found/not-found-page';

type Estado = 'cargando' | 'listo' | 'noEncontrado' | 'error';

/** Un comentario con solo espacios cuenta como vacío. */
const comentarioConTexto = (control: AbstractControl<string>): ValidationErrors | null =>
  control.value.trim() === '' ? { comentario: true } : null;

/** Formulario para escribir una reseña. Se guarda en memoria y aparece de inmediato en el detalle. */
@Component({
  selector: 'app-review-form-page',
  imports: [ReactiveFormsModule, RouterLink, ErrorState, LoadingIndicator, NotFoundPage, RatingInput],
  templateUrl: './review-form-page.html',
  styleUrl: './review-form-page.css',
})
export class ReviewFormPage implements OnInit {
  protected readonly estado = signal<Estado>('cargando');
  protected readonly alojamiento = signal<Accommodation | null>(null);
  protected readonly errorGeneral = signal('');

  protected readonly formulario = new FormGroup({
    calificacion: new FormControl(0, { nonNullable: true, validators: [Validators.min(1), Validators.max(5)] }),
    comentario: new FormControl('', { nonNullable: true, validators: [comentarioConTexto] }),
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alojamientoService: AccommodationService,
    private readonly resenaService: ReviewService,
    private readonly reservaService: BookingService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => void this.cargar(Number(params.get('id'))));
  }

  protected async cargar(id: number = Number(this.route.snapshot.paramMap.get('id'))): Promise<void> {
    this.estado.set('cargando');
    try {
      const alojamiento = await this.alojamientoService.getById(id);
      this.alojamiento.set(alojamiento ?? null);
      this.estado.set(alojamiento ? 'listo' : 'noEncontrado');
    } catch (error) {
      console.error('No se pudo cargar el formulario de reseña:', error);
      this.estado.set('error');
    }
  }

  protected elegirCalificacion(valor: number): void {
    this.formulario.controls.calificacion.setValue(valor);
    this.formulario.controls.calificacion.markAsTouched();
  }

  protected invalido(campo: 'calificacion' | 'comentario'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected async enviar(): Promise<void> {
    const alojamiento = this.alojamiento();
    if (!alojamiento) {
      return;
    }
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); // así aparecen los mensajes de lo que falta
      return;
    }
    const { calificacion, comentario } = this.formulario.getRawValue();
    // No se pide el nombre: se usa el de la última reserva si existe.
    const usuario = this.reservaService.reservas()[0]?.nombreHuesped ?? 'Visitante';
    try {
      await this.resenaService.agregar(alojamiento.id, usuario, calificacion, comentario);
      void this.router.navigate(['/alojamientos', alojamiento.id], { fragment: 'resenas' });
    } catch (error) {
      console.error('No se pudo guardar la reseña:', error);
      this.errorGeneral.set('No pudimos guardar tu reseña. Revisa los datos e inténtalo de nuevo.');
    }
  }

  protected cancelar(): void {
    const alojamiento = this.alojamiento();
    void this.router.navigate(alojamiento ? ['/alojamientos', alojamiento.id] : ['/explorar']);
  }
}

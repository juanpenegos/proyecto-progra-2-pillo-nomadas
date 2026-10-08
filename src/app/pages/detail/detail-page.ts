import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Accommodation } from '../../core/models/accommodation.model';
import { Quote } from '../../core/models/quote.model';
import { Review } from '../../core/models/review.model';
import { AccommodationService } from '../../core/services/accommodation.service';
import { BookingService } from '../../core/services/booking.service';
import { QuoteService } from '../../core/services/quote.service';
import { ReviewService } from '../../core/services/review.service';
import { QuoteErrors, QuoteInput } from '../../core/validators/quote-validators';
import { ContactForm, DatosContacto } from '../../shared/components/contact-form/contact-form';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { InfoList } from '../../shared/components/info-list/info-list';
import { LoadingIndicator } from '../../shared/components/loading-indicator/loading-indicator';
import { LocationMap } from '../../shared/components/location-map/location-map';
import { PropertyGallery } from '../../shared/components/property-gallery/property-gallery';
import { QuoteCard } from '../../shared/components/quote-card/quote-card';
import { ReviewCard } from '../../shared/components/review-card/review-card';
import { StarRating } from '../../shared/components/star-rating/star-rating';
import { NotFoundPage } from '../not-found/not-found-page';

type Estado = 'cargando' | 'listo' | 'noEncontrado' | 'error';

/**
 * Página "inteligente" del detalle: carga el alojamiento y sus reseñas, valida y calcula la
 * cotización con los servicios, y crea la reserva. Las piezas de presentación solo muestran.
 */
@Component({
  selector: 'app-detail-page',
  imports: [
    RouterLink, ContactForm, ErrorState, InfoList, LoadingIndicator, LocationMap, NotFoundPage,
    PropertyGallery, QuoteCard, ReviewCard, StarRating,
  ],
  templateUrl: './detail-page.html',
  styleUrl: './detail-page.css',
})
export class DetailPage implements OnInit {
  protected readonly estado = signal<Estado>('cargando');
  protected readonly alojamiento = signal<Accommodation | null>(null);
  protected readonly resenas = signal<Review[]>([]);

  protected readonly cotizacion = signal<Quote | null>(null);
  protected readonly errores = signal<QuoteErrors>({});
  protected readonly contactoAbierto = signal(false);
  protected readonly errorReserva = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly alojamientoService: AccommodationService,
    private readonly resenaService: ReviewService,
    private readonly cotizacionService: QuoteService,
    private readonly reservaService: BookingService,
  ) {}

  ngOnInit(): void {
    // Si el id de la URL cambia (de un alojamiento a otro), se vuelve a cargar todo.
    this.route.paramMap.subscribe((params) => void this.cargar(Number(params.get('id'))));
  }

  protected async cargar(id: number = Number(this.route.snapshot.paramMap.get('id'))): Promise<void> {
    this.estado.set('cargando');
    this.invalidarCotizacion();
    try {
      const alojamiento = await this.alojamientoService.getById(id);
      if (!alojamiento) {
        this.estado.set('noEncontrado'); // id inexistente o alojamiento inactivo
        return;
      }
      this.resenas.set(await this.resenaService.getByAccommodation(alojamiento.id));
      this.alojamiento.set(alojamiento);
      this.estado.set('listo');
    } catch (error) {
      console.error('No se pudo cargar el detalle:', error);
      this.estado.set('error');
    }
  }

  protected calcular(entrada: QuoteInput): void {
    const alojamiento = this.alojamiento();
    if (!alojamiento) {
      return;
    }
    const resultado = this.cotizacionService.cotizar(alojamiento, entrada);
    if (resultado.ok) {
      this.errores.set({});
      this.cotizacion.set(resultado.cotizacion);
    } else {
      this.cotizacion.set(null);
      this.errores.set(resultado.errores);
    }
  }

  /** Regla de negocio: si cambian fechas o huéspedes, la cotización anterior deja de ser válida. */
  protected invalidarCotizacion(): void {
    this.cotizacion.set(null);
    this.errores.set({});
    this.contactoAbierto.set(false);
    this.errorReserva.set('');
  }

  protected abrirContacto(): void {
    if (this.cotizacion()) {
      this.contactoAbierto.set(true);
    }
  }

  protected cerrarContacto(): void {
    this.contactoAbierto.set(false);
    this.errorReserva.set('');
  }

  protected confirmar(contacto: DatosContacto): void {
    const alojamiento = this.alojamiento();
    const cotizacion = this.cotizacion();
    if (!alojamiento || !cotizacion) {
      return; // sin cotización válida no hay reserva
    }
    try {
      const reserva = this.reservaService.crear(alojamiento, cotizacion, contacto.nombre, contacto.correo);
      void this.router.navigate(['/reserva-confirmada', reserva.id]);
    } catch (error) {
      console.error('No se pudo crear la reserva:', error);
      this.errorReserva.set('No pudimos registrar tu reserva. Revisa tus datos e inténtalo de nuevo.');
    }
  }
}

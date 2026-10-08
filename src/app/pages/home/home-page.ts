import { Component, OnInit, computed, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Accommodation } from '../../core/models/accommodation.model';
import { Review } from '../../core/models/review.model';
import { AccommodationService, ordenarAlojamientos } from '../../core/services/accommodation.service';
import { ReviewService } from '../../core/services/review.service';
import { AccommodationCard } from '../../shared/components/accommodation-card/accommodation-card';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingIndicator } from '../../shared/components/loading-indicator/loading-indicator';
import { CriteriosBusqueda, HomeHero } from './home-hero/home-hero';
import { HostBanner } from './host-banner/host-banner';
import { calcularCifras } from './home-stats';

type Estado = 'cargando' | 'listo' | 'error';

const CANTIDAD_DESTACADOS = 3;

export interface Destino {
  ciudad: string;
}

/** Página "inteligente": pide los datos a los servicios y se los pasa a las piezas de presentación. */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, AccommodationCard, ErrorState, HomeHero, HostBanner, LoadingIndicator],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  protected readonly estado = signal<Estado>('cargando');

  private readonly alojamientos = signal<Accommodation[]>([]);
  private readonly resenas = signal<Review[]>([]);

  protected readonly cifras = computed(() => calcularCifras(this.alojamientos(), this.resenas()));

  /** Los 3 alojamientos activos mejor calificados. */
  protected readonly destacados = computed(() =>
    ordenarAlojamientos(this.alojamientos(), 'mejor-valorados').slice(0, CANTIDAD_DESTACADOS),
  );

  /** Ciudades con alojamientos activos, sin repetir. */
  protected readonly ciudades = computed(() => [...new Set(this.alojamientos().map((a) => a.ciudad))]);

  /** Una tarjeta de "Explora por destino" por cada ciudad. */
  protected readonly destinos = computed<Destino[]>(() => this.ciudades().map((ciudad) => ({ ciudad })));

  /** Opciones del selector de huéspedes: de 1 hasta la mayor capacidad que existe. */
  protected readonly opcionesHuespedes = computed(() => {
    const maximo = Math.max(0, ...this.alojamientos().map((a) => a.capacidad));
    return Array.from({ length: maximo }, (_, i) => i + 1);
  });

  constructor(
    private readonly alojamientoService: AccommodationService,
    private readonly resenaService: ReviewService,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.estado.set('cargando');
    try {
      const [alojamientos, resenas] = await Promise.all([
        this.alojamientoService.getActive(),
        this.resenaService.getAll(),
      ]);
      this.alojamientos.set(alojamientos);
      this.resenas.set(resenas);
      this.estado.set('listo');
    } catch (error) {
      console.error('No se pudo cargar el inicio:', error);
      this.estado.set('error');
    }
  }

  /** Lleva a Explorar con los criterios elegidos como parámetros de la URL. */
  protected buscar({ ciudad, huespedes }: CriteriosBusqueda): void {
    const queryParams: Record<string, string | number> = {};
    if (ciudad !== '') {
      queryParams['ciudad'] = ciudad;
    }
    if (huespedes !== null) {
      queryParams['huespedes'] = huespedes;
    }
    void this.router.navigate(['/explorar'], { queryParams });
  }
}

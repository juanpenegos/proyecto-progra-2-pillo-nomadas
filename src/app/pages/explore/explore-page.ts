import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Accommodation } from '../../core/models/accommodation.model';
import { FILTROS_VACIOS } from '../../core/models/search-filters.model';
import {
  AccommodationService,
  filtrarAlojamientos,
  ordenarAlojamientos,
} from '../../core/services/accommodation.service';
import {
  ExploreCriteria,
  ORDEN_POR_DEFECTO,
  aQueryParams,
  leerCriterios,
} from '../../core/utils/filter-params';
import { AccommodationCard } from '../../shared/components/accommodation-card/accommodation-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { FilterBar } from '../../shared/components/filter-bar/filter-bar';
import { LoadingIndicator } from '../../shared/components/loading-indicator/loading-indicator';
import { PageBanner } from '../../shared/components/page-banner/page-banner';

type Estado = 'cargando' | 'listo' | 'error';

/**
 * Página "inteligente" de Explorar. La URL es la fuente de verdad de los filtros:
 * cuando el usuario cambia uno, se actualiza la URL y de ahí se recalcula la lista.
 */
@Component({
  selector: 'app-explore-page',
  imports: [AccommodationCard, EmptyState, ErrorState, FilterBar, LoadingIndicator, PageBanner],
  templateUrl: './explore-page.html',
  styleUrl: './explore-page.css',
})
export class ExplorePage implements OnInit {
  protected readonly estado = signal<Estado>('cargando');
  protected readonly criterios = signal<ExploreCriteria>({
    filtros: FILTROS_VACIOS,
    orden: ORDEN_POR_DEFECTO,
  });

  private readonly activos = signal<Accommodation[]>([]);

  protected readonly ciudades = computed(() => [...new Set(this.activos().map((a) => a.ciudad))]);
  protected readonly tipos = computed(() => [...new Set(this.activos().map((a) => a.tipo))]);
  protected readonly opcionesHuespedes = computed(() => {
    const maximo = Math.max(0, ...this.activos().map((a) => a.capacidad));
    return Array.from({ length: maximo }, (_, i) => i + 1);
  });

  /** Se recalcula sola cada vez que cambian los datos o los criterios. */
  protected readonly resultados = computed(() => {
    const { filtros, orden } = this.criterios();
    return ordenarAlojamientos(filtrarAlojamientos(this.activos(), filtros), orden);
  });

  protected readonly titulo = computed(() => {
    const n = this.resultados().length;
    return n === 1 ? '1 alojamiento encontrado' : `${n} alojamientos encontrados`;
  });

  constructor(
    private readonly alojamientoService: AccommodationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    // Cada vez que cambia la URL se vuelven a leer los criterios.
    this.route.queryParamMap.subscribe((params) => this.criterios.set(leerCriterios(params)));
    await this.cargar();
  }

  protected async cargar(): Promise<void> {
    this.estado.set('cargando');
    try {
      this.activos.set(await this.alojamientoService.getActive());
      this.estado.set('listo');
    } catch (error) {
      console.error('No se pudo cargar Explorar:', error);
      this.estado.set('error');
    }
  }

  protected aplicar(criterios: ExploreCriteria): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: aQueryParams(criterios),
      replaceUrl: true,
    });
  }

  protected limpiar(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}

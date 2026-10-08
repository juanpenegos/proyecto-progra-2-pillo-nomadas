import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Accommodation, GalleryImage } from '../../core/models/accommodation.model';
import { AccommodationService } from '../../core/services/accommodation.service';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { ImageWithFallback } from '../../shared/components/image-with-fallback/image-with-fallback';
import { LoadingIndicator } from '../../shared/components/loading-indicator/loading-indicator';
import { NotFoundPage } from '../not-found/not-found-page';

type Estado = 'cargando' | 'listo' | 'noEncontrado' | 'error';

export const TODAS = 'Todas';

/**
 * Galería completa de un alojamiento. Si el alojamiento trae fotos descritas (`galeria`) las usa,
 * con su título y categoría; si no, muestra sus `imagenes` bajo la pestaña "Todas".
 */
@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, ErrorState, ImageWithFallback, LoadingIndicator, NotFoundPage],
  templateUrl: './gallery-page.html',
  styleUrl: './gallery-page.css',
})
export class GalleryPage implements OnInit {
  protected readonly estado = signal<Estado>('cargando');
  protected readonly alojamiento = signal<Accommodation | null>(null);
  protected readonly categoria = signal(TODAS);

  protected readonly fotos = computed<GalleryImage[]>(() => {
    const a = this.alojamiento();
    if (!a) {
      return [];
    }
    return (
      a.galeria ??
      a.imagenes.map((src, i) => ({ src, titulo: `Foto ${i + 1}`, categoria: TODAS }))
    );
  });

  /** "Todas" y luego cada categoría que exista, sin repetir y en el orden en que aparecen. */
  protected readonly categorias = computed(() => [
    TODAS,
    ...new Set(this.fotos().map((f) => f.categoria).filter((c) => c !== TODAS)),
  ]);

  protected readonly visibles = computed(() =>
    this.categoria() === TODAS ? this.fotos() : this.fotos().filter((f) => f.categoria === this.categoria()),
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly alojamientoService: AccommodationService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => void this.cargar(Number(params.get('id'))));
  }

  protected async cargar(id: number = Number(this.route.snapshot.paramMap.get('id'))): Promise<void> {
    this.estado.set('cargando');
    this.categoria.set(TODAS);
    try {
      const alojamiento = await this.alojamientoService.getById(id);
      this.alojamiento.set(alojamiento ?? null);
      this.estado.set(alojamiento ? 'listo' : 'noEncontrado');
    } catch (error) {
      console.error('No se pudo cargar la galería:', error);
      this.estado.set('error');
    }
  }

  protected elegir(categoria: string): void {
    this.categoria.set(categoria);
  }
}

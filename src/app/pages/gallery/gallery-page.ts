import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Accommodation, GalleryImage } from '../../core/models/accommodation.model';
import { AccommodationService } from '../../core/services/accommodation.service';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { ImageWithFallback } from '../../shared/components/image-with-fallback/image-with-fallback';
import { LoadingIndicator } from '../../shared/components/loading-indicator/loading-indicator';
import { NotFoundPage } from '../not-found/not-found-page';
import { GalleryBar } from './gallery-bar/gallery-bar';

type Estado = 'cargando' | 'listo' | 'noEncontrado' | 'error';

export const TODAS = 'Todas';

/** Forma del mosaico de una sección, según cuántas fotos tiene (igual que en el diseño). */
export type FormaMosaico = 'tres' | 'dos' | 'dos-bajo' | 'lista';

export interface SeccionGaleria {
  titulo: string;
  descripcion: string;
  forma: FormaMosaico;
  fotos: GalleryImage[];
}

/**
 * Galería completa de un alojamiento. Si el alojamiento trae fotos descritas con sus secciones
 * (`galeria` y `galeriaSecciones`), las muestra en bloques con título y descripción; al elegir una
 * pestaña muestra solo las fotos de esa categoría. Si no, muestra sus `imagenes` bajo "Todas".
 */
@Component({
  selector: 'app-gallery-page',
  imports: [RouterLink, ErrorState, GalleryBar, ImageWithFallback, LoadingIndicator, NotFoundPage],
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

  /** "Todas" y luego las categorías en el orden del diseño (o, si falta, el de aparición). */
  protected readonly categorias = computed(() => {
    const declaradas = this.alojamiento()?.galeriaCategorias;
    const deLasFotos = this.fotos().map((f) => f.categoria).filter((c) => c !== TODAS);
    return [TODAS, ...new Set(declaradas ?? deLasFotos)];
  });

  /** Secciones con título, descripción y la forma de su mosaico. Vacío si el alojamiento no las trae. */
  protected readonly secciones = computed<SeccionGaleria[]>(() => {
    const definiciones = this.alojamiento()?.galeriaSecciones ?? [];
    let dosFotosVistas = 0;
    return definiciones
      .map((definicion) => ({
        ...definicion,
        fotos: this.fotos().filter((f) => f.seccion === definicion.titulo),
      }))
      .filter((seccion) => seccion.fotos.length > 0)
      .map((seccion) => {
        let forma: FormaMosaico = 'lista';
        if (seccion.fotos.length === 3) {
          forma = 'tres';
        } else if (seccion.fotos.length === 2) {
          // En el diseño la primera sección de dos fotos es más alta que las siguientes.
          forma = dosFotosVistas === 0 ? 'dos' : 'dos-bajo';
          dosFotosVistas++;
        }
        return { ...seccion, forma };
      });
  });

  /** Con "Todas" y secciones definidas se muestran los bloques; si no, una cuadrícula de fotos. */
  protected readonly conSecciones = computed(
    () => this.categoria() === TODAS && this.secciones().length > 0,
  );

  protected readonly visibles = computed(() =>
    this.categoria() === TODAS ? this.fotos() : this.fotos().filter((f) => f.categoria === this.categoria()),
  );

  /** "Guatapé, Antioquia" → "Antioquia", como en el cierre de la galería. */
  protected readonly region = computed(() => {
    const ubicacion = this.alojamiento()?.ubicacion ?? '';
    return ubicacion.split(',').pop()?.trim() ?? ubicacion;
  });

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

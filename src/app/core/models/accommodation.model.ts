export type AccommodationType = 'Apartamento' | 'Cabaña' | 'Casa';

/** Foto de la galería completa (campo opcional que complementa el JSON). */
export interface GalleryImage {
  src: string;
  titulo: string;
  /** Pestaña por la que se puede filtrar (Exterior, Embalse…). */
  categoria: string;
  /** Título de la sección de la galería a la que pertenece la foto. */
  seccion?: string;
}

/** Bloque de la galería con título y descripción, como en el diseño. */
export interface GallerySection {
  titulo: string;
  descripcion: string;
}

/** Alojamiento tal como viene en el JSON del enunciado. */
export interface Accommodation {
  id: number;
  nombre: string;
  descripcion: string;
  ciudad: string;
  ubicacion: string;
  tipo: AccommodationType;
  capacidad: number;
  habitaciones: number;
  camas: number;
  banos: number;
  precioNoche: number;
  tarifaLimpieza: number;
  calificacion: number;
  activo: boolean;
  imagenPrincipal: string;
  imagenes: string[];
  servicios: string[];
  reglas: string[];
  galeria?: GalleryImage[];
  galeriaSecciones?: GallerySection[];
  /** Orden de las pestañas de la galería; si falta, salen de las categorías de las fotos. */
  galeriaCategorias?: string[];
}

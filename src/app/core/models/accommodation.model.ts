export type AccommodationType = 'Apartamento' | 'Cabaña' | 'Casa';

/** Foto de la galería completa (campo opcional que complementa el JSON). */
export interface GalleryImage {
  src: string;
  titulo: string;
  categoria: string;
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
}

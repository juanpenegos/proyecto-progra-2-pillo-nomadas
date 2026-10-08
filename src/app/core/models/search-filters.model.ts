export type SortOrder = 'mejor-valorados' | 'menor-precio' | 'mayor-precio';

export interface SearchFilters {
  /** Texto vacío significa "todas las ciudades". */
  ciudad: string;
  /** null significa "sin límite de huéspedes". */
  huespedes: number | null;
  /** Texto vacío significa "todos los tipos". */
  tipo: string;
  /** null significa "sin precio máximo". */
  precioMax: number | null;
}

export const FILTROS_VACIOS: SearchFilters = {
  ciudad: '',
  huespedes: null,
  tipo: '',
  precioMax: null,
};

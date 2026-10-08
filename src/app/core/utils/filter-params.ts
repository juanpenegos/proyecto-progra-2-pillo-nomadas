import { ParamMap, Params } from '@angular/router';
import { FILTROS_VACIOS, SearchFilters, SortOrder } from '../models/search-filters.model';

export const ORDEN_POR_DEFECTO: SortOrder = 'mejor-valorados';

const ORDENES: SortOrder[] = ['mejor-valorados', 'menor-precio', 'mayor-precio'];

export interface ExploreCriteria {
  filtros: SearchFilters;
  orden: SortOrder;
}

/** Devuelve el número si es un entero mayor que cero; si no, null. */
const enteroPositivo = (texto: string | null): number | null => {
  const n = Number(texto);
  return texto !== null && Number.isInteger(n) && n > 0 ? n : null;
};

/** Devuelve el número si es mayor que cero; si no, null. */
const numeroPositivo = (texto: string | null): number | null => {
  const n = Number(texto);
  return texto !== null && texto !== '' && Number.isFinite(n) && n > 0 ? n : null;
};

/** Lee los criterios desde la URL. Los valores inválidos se ignoran en lugar de romper la página. */
export const leerCriterios = (params: ParamMap): ExploreCriteria => {
  const orden = params.get('orden');
  return {
    filtros: {
      ciudad: params.get('ciudad') ?? '',
      huespedes: enteroPositivo(params.get('huespedes')),
      tipo: params.get('tipo') ?? '',
      precioMax: numeroPositivo(params.get('precioMax')),
    },
    orden: ORDENES.find((o) => o === orden) ?? ORDEN_POR_DEFECTO,
  };
};

/** Convierte los criterios en parámetros de URL, omitiendo los que están vacíos o por defecto. */
export const aQueryParams = ({ filtros, orden }: ExploreCriteria): Params => {
  const params: Params = {};
  if (filtros.ciudad !== '') {
    params['ciudad'] = filtros.ciudad;
  }
  if (filtros.huespedes !== null) {
    params['huespedes'] = filtros.huespedes;
  }
  if (filtros.tipo !== '') {
    params['tipo'] = filtros.tipo;
  }
  if (filtros.precioMax !== null) {
    params['precioMax'] = filtros.precioMax;
  }
  if (orden !== ORDEN_POR_DEFECTO) {
    params['orden'] = orden;
  }
  return params;
};

export const hayFiltrosActivos = (filtros: SearchFilters): boolean =>
  filtros.ciudad !== FILTROS_VACIOS.ciudad ||
  filtros.huespedes !== FILTROS_VACIOS.huespedes ||
  filtros.tipo !== FILTROS_VACIOS.tipo ||
  filtros.precioMax !== FILTROS_VACIOS.precioMax;

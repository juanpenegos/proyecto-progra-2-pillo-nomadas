import { convertToParamMap } from '@angular/router';
import { FILTROS_VACIOS } from '../models/search-filters.model';
import { aQueryParams, hayFiltrosActivos, leerCriterios } from './filter-params';

describe('filter-params', () => {
  it('sin parámetros devuelve filtros vacíos y el orden por defecto', () => {
    const c = leerCriterios(convertToParamMap({}));
    expect(c.filtros).toEqual(FILTROS_VACIOS);
    expect(c.orden).toBe('mejor-valorados');
  });

  it('lee todos los parámetros válidos', () => {
    const c = leerCriterios(
      convertToParamMap({ ciudad: 'Bogotá', huespedes: '3', tipo: 'Casa', precioMax: '400000', orden: 'menor-precio' }),
    );
    expect(c.filtros).toEqual({ ciudad: 'Bogotá', huespedes: 3, tipo: 'Casa', precioMax: 400000 });
    expect(c.orden).toBe('menor-precio');
  });

  it('ignora valores inválidos en lugar de fallar', () => {
    const c = leerCriterios(
      convertToParamMap({ huespedes: 'abc', precioMax: '-5', orden: 'inventado' }),
    );
    expect(c.filtros.huespedes).toBeNull();
    expect(c.filtros.precioMax).toBeNull();
    expect(c.orden).toBe('mejor-valorados');
  });

  it('rechaza huéspedes en cero, negativos o con decimales', () => {
    expect(leerCriterios(convertToParamMap({ huespedes: '0' })).filtros.huespedes).toBeNull();
    expect(leerCriterios(convertToParamMap({ huespedes: '-2' })).filtros.huespedes).toBeNull();
    expect(leerCriterios(convertToParamMap({ huespedes: '2.5' })).filtros.huespedes).toBeNull();
  });

  it('aQueryParams omite los valores vacíos y el orden por defecto', () => {
    expect(aQueryParams({ filtros: FILTROS_VACIOS, orden: 'mejor-valorados' })).toEqual({});
    expect(
      aQueryParams({ filtros: { ...FILTROS_VACIOS, ciudad: 'Cali', precioMax: 200000 }, orden: 'mayor-precio' }),
    ).toEqual({ ciudad: 'Cali', precioMax: 200000, orden: 'mayor-precio' });
  });

  it('hayFiltrosActivos detecta si hay algún filtro aplicado', () => {
    expect(hayFiltrosActivos(FILTROS_VACIOS)).toBe(false);
    expect(hayFiltrosActivos({ ...FILTROS_VACIOS, tipo: 'Casa' })).toBe(true);
  });
});

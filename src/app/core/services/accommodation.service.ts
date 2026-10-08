import { Injectable } from '@angular/core';
import { Accommodation } from '../models/accommodation.model';
import { SearchFilters, SortOrder } from '../models/search-filters.model';
import { AccommodationRepository } from '../repositories/accommodation.repository';

/** Funciones puras: no dependen de Angular y son fáciles de probar. */
export const filtrarAlojamientos = (
  alojamientos: Accommodation[],
  filtros: SearchFilters,
): Accommodation[] =>
  alojamientos.filter(
    (a) =>
      (filtros.ciudad === '' || a.ciudad === filtros.ciudad) &&
      (filtros.tipo === '' || a.tipo === filtros.tipo) &&
      (filtros.huespedes === null || a.capacidad >= filtros.huespedes) &&
      (filtros.precioMax === null || a.precioNoche <= filtros.precioMax),
  );

export const ordenarAlojamientos = (
  alojamientos: Accommodation[],
  orden: SortOrder,
): Accommodation[] => {
  const copia = [...alojamientos]; // no se muta el arreglo original
  switch (orden) {
    case 'menor-precio':
      return copia.sort((a, b) => a.precioNoche - b.precioNoche);
    case 'mayor-precio':
      return copia.sort((a, b) => b.precioNoche - a.precioNoche);
    case 'mejor-valorados':
      return copia.sort((a, b) => b.calificacion - a.calificacion);
  }
};

@Injectable({ providedIn: 'root' })
export class AccommodationService {
  constructor(private readonly repository: AccommodationRepository) {}

  /** Única puerta de entrada: aquí se descartan los alojamientos inactivos. */
  async getActive(): Promise<Accommodation[]> {
    const datos = await this.repository.getData();
    return datos.alojamientos.filter((a) => a.activo);
  }

  /** Devuelve undefined si el id no existe o el alojamiento está inactivo. */
  async getById(id: number): Promise<Accommodation | undefined> {
    const activos = await this.getActive();
    return activos.find((a) => a.id === id);
  }

  async search(
    filtros: SearchFilters,
    orden: SortOrder = 'mejor-valorados',
  ): Promise<Accommodation[]> {
    const activos = await this.getActive();
    return ordenarAlojamientos(filtrarAlojamientos(activos, filtros), orden);
  }

  async getCities(): Promise<string[]> {
    const activos = await this.getActive();
    return [...new Set(activos.map((a) => a.ciudad))];
  }

  async getTypes(): Promise<string[]> {
    const activos = await this.getActive();
    return [...new Set(activos.map((a) => a.tipo))];
  }
}

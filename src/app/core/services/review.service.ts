import { Injectable } from '@angular/core';
import { Review } from '../models/review.model';
import { AccommodationRepository } from '../repositories/accommodation.repository';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private readonly repository: AccommodationRepository) {}

  async getAll(): Promise<Review[]> {
    const datos = await this.repository.getData();
    return datos.resenas;
  }

  /** Reseñas de un alojamiento, la más reciente primero. */
  async getByAccommodation(alojamientoId: number): Promise<Review[]> {
    const todas = await this.getAll();
    return todas
      .filter((r) => r.alojamientoId === alojamientoId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }
}

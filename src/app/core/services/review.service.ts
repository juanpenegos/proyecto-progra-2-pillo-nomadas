import { Injectable, signal } from '@angular/core';
import { Review } from '../models/review.model';
import { AccommodationRepository } from '../repositories/accommodation.repository';
import { hoyISO } from '../utils/dates';

/** Reseñas del JSON más las que escribe el usuario, que viven en memoria (se pierden al recargar). */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly _nuevas = signal<Review[]>([]);

  constructor(private readonly repository: AccommodationRepository) {}

  async getAll(): Promise<Review[]> {
    const datos = await this.repository.getData();
    return [...this._nuevas(), ...datos.resenas];
  }

  /** Reseñas de un alojamiento, la más reciente primero (a igual fecha, la última en escribirse). */
  async getByAccommodation(alojamientoId: number): Promise<Review[]> {
    const todas = await this.getAll();
    return todas
      .filter((r) => r.alojamientoId === alojamientoId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
  }

  /**
   * Guarda una reseña nueva. La calificación mostrada del alojamiento sigue siendo la del JSON:
   * las reseñas nuevas no la recalculan.
   */
  async agregar(alojamientoId: number, usuario: string, calificacion: number, comentario: string): Promise<Review> {
    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
      throw new Error('La calificación debe ser un número entero de 1 a 5.');
    }
    if (comentario.trim() === '') {
      throw new Error('El comentario no puede estar vacío.');
    }
    const todas = await this.getAll();
    const resena: Review = {
      id: Math.max(0, ...todas.map((r) => r.id)) + 1,
      alojamientoId,
      usuario: usuario.trim() || 'Visitante',
      calificacion,
      comentario: comentario.trim(),
      fecha: hoyISO(),
    };
    this._nuevas.update((lista) => [resena, ...lista]); // copia nueva, sin mutar la anterior
    return resena;
  }
}

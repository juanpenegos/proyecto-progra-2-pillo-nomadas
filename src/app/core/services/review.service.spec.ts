import { MarketplaceData } from '../models/marketplace-data.model';
import { AccommodationRepository } from '../repositories/accommodation.repository';
import { ReviewService } from './review.service';

const datos: MarketplaceData = {
  alojamientos: [],
  resenas: [
    { id: 1, alojamientoId: 1, usuario: 'Ana', calificacion: 5, comentario: 'a', fecha: '2026-09-01' },
    { id: 2, alojamientoId: 2, usuario: 'Luis', calificacion: 4, comentario: 'b', fecha: '2026-09-10' },
    { id: 3, alojamientoId: 1, usuario: 'Eva', calificacion: 3, comentario: 'c', fecha: '2026-09-20' },
  ],
};

class RepositorioFalso extends AccommodationRepository {
  getData(): Promise<MarketplaceData> {
    return Promise.resolve(datos);
  }
}

describe('ReviewService', () => {
  const servicio = new ReviewService(new RepositorioFalso());

  it('devuelve todas las reseñas', async () => {
    expect((await servicio.getAll()).length).toBe(3);
  });

  it('devuelve las reseñas de un alojamiento con la más reciente primero', async () => {
    const r = await servicio.getByAccommodation(1);
    expect(r.map((x) => x.id)).toEqual([3, 1]);
  });

  it('devuelve una lista vacía si el alojamiento no tiene reseñas', async () => {
    expect(await servicio.getByAccommodation(99)).toEqual([]);
  });
});

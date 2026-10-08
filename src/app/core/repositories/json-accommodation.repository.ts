import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MarketplaceData } from '../models/marketplace-data.model';
import { AccommodationRepository } from './accommodation.repository';

/** Adaptador que lee los datos del archivo JSON público. */
@Injectable()
export class JsonAccommodationRepository extends AccommodationRepository {
  private readonly url = 'assets/data/marketplace-data.json';

  constructor(private readonly http: HttpClient) {
    super();
  }

  /** Se guarda la petición para leer el archivo una sola vez. */
  private pendiente: Promise<MarketplaceData> | null = null;

  getData(): Promise<MarketplaceData> {
    if (!this.pendiente) {
      this.pendiente = this.leerArchivo();
    }
    return this.pendiente;
  }

  private async leerArchivo(): Promise<MarketplaceData> {
    try {
      return await firstValueFrom(this.http.get<MarketplaceData>(this.url));
    } catch (error) {
      this.pendiente = null; // permite reintentar después de un error
      console.error('No se pudo cargar el archivo de datos:', error);
      throw new Error('No se pudieron cargar los alojamientos.');
    }
  }
}

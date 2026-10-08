import { MarketplaceData } from '../models/marketplace-data.model';

/**
 * Puerto de acceso a datos: dice QUÉ se necesita, no CÓMO se obtiene.
 * Los servicios dependen de esta clase abstracta, no del JSON.
 */
export abstract class AccommodationRepository {
  abstract getData(): Promise<MarketplaceData>;
}

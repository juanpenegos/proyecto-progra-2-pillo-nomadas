import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { AccommodationRepository } from './core/repositories/accommodation.repository';
import { JsonAccommodationRepository } from './core/repositories/json-accommodation.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Al navegar a otra pantalla se vuelve al inicio; con "atrás" se recupera la posición anterior.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(),
    // Aquí se decide qué implementación usa la app para el puerto de datos.
    { provide: AccommodationRepository, useClass: JsonAccommodationRepository },
  ],
};

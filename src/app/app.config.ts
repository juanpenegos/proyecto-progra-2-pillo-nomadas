import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AccommodationRepository } from './core/repositories/accommodation.repository';
import { JsonAccommodationRepository } from './core/repositories/json-accommodation.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    // Aquí se decide qué implementación usa la app para el puerto de datos.
    { provide: AccommodationRepository, useClass: JsonAccommodationRepository },
  ],
};

import { Routes } from '@angular/router';
import { ConfirmationPage } from './pages/confirmation/confirmation-page';
import { DetailPage } from './pages/detail/detail-page';
import { ExplorePage } from './pages/explore/explore-page';
import { GalleryPage } from './pages/gallery/gallery-page';
import { HomePage } from './pages/home/home-page';
import { MyBookingsPage } from './pages/my-bookings/my-bookings-page';
import { NotFoundPage } from './pages/not-found/not-found-page';
import { ReviewFormPage } from './pages/review-form/review-form-page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Inicio · Pillo Nómadas' },
  { path: 'explorar', component: ExplorePage, title: 'Explorar · Pillo Nómadas' },
  { path: 'alojamientos/:id', component: DetailPage, title: 'Alojamiento · Pillo Nómadas' },
  {
    path: 'alojamientos/:id/galeria',
    component: GalleryPage,
    title: 'Galería · Pillo Nómadas',
    data: { sinMarco: true }, // pantalla completa: sin barra de navegación ni pie
  },
  { path: 'alojamientos/:id/resena', component: ReviewFormPage, title: 'Escribir una reseña · Pillo Nómadas' },
  { path: 'reserva-confirmada/:id', component: ConfirmationPage, title: 'Reserva confirmada · Pillo Nómadas' },
  { path: 'mis-reservas', component: MyBookingsPage, title: 'Mis reservas · Pillo Nómadas' },
  { path: '**', component: NotFoundPage, title: 'No encontrado · Pillo Nómadas' },
];

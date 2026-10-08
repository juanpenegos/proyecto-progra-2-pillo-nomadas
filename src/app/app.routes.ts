import { Routes } from '@angular/router';
import { ExplorePage } from './pages/explore/explore-page';
import { HomePage } from './pages/home/home-page';
import { MyBookingsPage } from './pages/my-bookings/my-bookings-page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Inicio · Pillo Nómadas' },
  { path: 'explorar', component: ExplorePage, title: 'Explorar · Pillo Nómadas' },
  { path: 'mis-reservas', component: MyBookingsPage, title: 'Mis reservas · Pillo Nómadas' },
];

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

/** Se muestra para rutas desconocidas y para alojamientos inexistentes o inactivos. */
@Component({
  selector: 'app-not-found-page',
  imports: [EmptyState],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.css',
})
export class NotFoundPage {
  constructor(private readonly router: Router) {}

  protected irAExplorar(): void {
    void this.router.navigate(['/explorar']);
  }
}

import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('informa y ofrece volver a explorar', async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelectorAll('h1').length).toBe(1);
    expect(html.textContent).toContain('No encontramos lo que buscas.');

    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    html.querySelector<HTMLButtonElement>('button')!.click();
    expect(navegar).toHaveBeenCalledWith(['/explorar']);
  });
});

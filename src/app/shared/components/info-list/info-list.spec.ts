import { TestBed } from '@angular/core/testing';
import { InfoList } from './info-list';

describe('InfoList', () => {
  it('muestra un elemento por cada texto recibido', async () => {
    await TestBed.configureTestingModule({ imports: [InfoList] }).compileComponents();
    const fixture = TestBed.createComponent(InfoList);
    fixture.componentRef.setInput('elementos', ['Wi-Fi', 'Cocina', 'BBQ']);
    await fixture.whenStable();
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li')).map((li) =>
      li.textContent?.trim(),
    );
    expect(items).toEqual(['Wi-Fi', 'Cocina', 'BBQ']);
  });
});

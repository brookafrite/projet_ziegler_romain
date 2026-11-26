import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HighlightPollutionDirective } from './highlight-pollution.directive';

/** Petit composant de test qui porte la directive. */
@Component({
  imports: [HighlightPollutionDirective],
  template: `<span [appHighlightPollution]="indice()">niveau</span>`,
})
class HostComponent {
  readonly indice = signal<number | null>(null);
}

describe('HighlightPollutionDirective', () => {
  function backgroundFor(indice: number | null): string {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.indice.set(indice);
    fixture.detectChanges();
    return (fixture.nativeElement.querySelector('span') as HTMLElement).style.backgroundColor;
  }

  it('should color the background according to the level', () => {
    expect(backgroundFor(10)).toBe('rgb(211, 242, 208)'); // vert clair, Faible
    expect(backgroundFor(35)).toBe('rgb(255, 240, 154)'); // jaune, Modérée
    expect(backgroundFor(75)).toBe('rgb(255, 190, 122)'); // orange, Élevée
    expect(backgroundFor(150)).toBe('rgb(198, 40, 40)'); // rouge, Dangereuse
    expect(backgroundFor(null)).toBe('rgb(231, 229, 224)'); // gris, Non évalué
  });

  it('should follow the index when it changes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    const span = (fixture.nativeElement as HTMLElement).querySelector('span')!;

    fixture.componentInstance.indice.set(5);
    fixture.detectChanges();
    expect(span.style.backgroundColor).toBe('rgb(211, 242, 208)');

    fixture.componentInstance.indice.set(120);
    fixture.detectChanges();
    expect(span.style.backgroundColor).toBe('rgb(198, 40, 40)');
    expect(span.style.color).toBe('rgb(255, 255, 255)');
  });
});

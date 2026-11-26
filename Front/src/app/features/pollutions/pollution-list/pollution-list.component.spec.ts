import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { PollutionListComponent } from './pollution-list.component';

const base = { description: '', latitude: 45, longitude: 4, photoUrl: null };
const POLLUTIONS: Pollution[] = [
  { ...base, id: 1, titre: 'Bidons au canal', type: 'Chimique', dateObservation: '2026-10-02', lieu: 'Canal', indice: 75 },
  { ...base, id: 2, titre: 'Sacs plastiques', type: 'Plastique', dateObservation: '2026-10-09', lieu: 'Parc', indice: 30 },
  { ...base, id: 3, titre: 'Gravats', type: 'Dépôt sauvage', dateObservation: '2026-09-21', lieu: 'Forêt', indice: null },
];

describe('PollutionListComponent', () => {
  let fixture: ComponentFixture<PollutionListComponent>;
  let component: PollutionListComponent;

  /** Simule un critère présent dans l'adresse (?nom=valeur), comme le ferait le routeur. */
  function setQueryParam(name: string, value: string | undefined): void {
    fixture.componentRef.setInput(name, value);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PollutionListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    fixture = TestBed.createComponent(PollutionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit, donc le GET
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/pollutions`)
      .flush(POLLUTIONS);
  });

  it('should list every pollution, most recent first', () => {
    expect(component.filtered().map((p) => p.id)).toEqual([2, 1, 3]);
  });

  it('should filter by type', () => {
    setQueryParam('type', 'Plastique');
    expect(component.filtered().map((p) => p.id)).toEqual([2]);
  });

  it('should filter by text, ignoring case and accents', () => {
    setQueryParam('recherche', 'CANAL');
    expect(component.filtered().map((p) => p.id)).toEqual([1]);
  });

  it('should filter by date range and combine criteria', () => {
    setQueryParam('du', '2026-10-01');
    expect(component.filtered().map((p) => p.id)).toEqual([2, 1]);

    setQueryParam('au', '2026-10-05');
    expect(component.filtered().map((p) => p.id)).toEqual([1]);
  });

  it('should filter by danger level, « Non évalué » included', () => {
    setQueryParam('niveau', 'elevee');
    expect(component.filtered().map((p) => p.id)).toEqual([1]);

    setQueryParam('niveau', 'non-evalue');
    expect(component.filtered().map((p) => p.id)).toEqual([3]);
  });

  it('should ignore an unknown level in the address', () => {
    setQueryParam('niveau', 'bidon');
    expect(component.filtered().length).toBe(3);
  });

  it('should sort by danger level, unevaluated pollutions last', () => {
    setQueryParam('tri', 'dangereuses');
    expect(component.filtered().map((p) => p.id)).toEqual([1, 2, 3]);

    setQueryParam('tri', 'moins-dangereuses');
    expect(component.filtered().map((p) => p.id)).toEqual([2, 1, 3]);
  });

  it('should sort oldest first', () => {
    setQueryParam('tri', 'anciennes');
    expect(component.filtered().map((p) => p.id)).toEqual([3, 1, 2]);
  });

  it('should keep the sort order when the filters are cleared', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    setQueryParam('tri', 'dangereuses');

    component.resetFilters();
    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { tri: 'dangereuses' } }));
  });

  it('should write a criterion in the address, keeping the others', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.setFilter('type', 'Chimique');
    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { type: 'Chimique' },
      queryParamsHandling: 'merge',
    }));

    component.setFilter('type', ''); // « Tous les types » : le paramètre disparaît de l'adresse
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({ queryParams: { type: null } }));
  });
});

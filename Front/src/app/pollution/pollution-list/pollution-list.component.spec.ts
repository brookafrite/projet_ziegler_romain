import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { PollutionListComponent } from './pollution-list.component';

const base = { description: '', latitude: 45, longitude: 4, photoUrl: null };
const POLLUTIONS: Pollution[] = [
  { ...base, id: 1, titre: 'Bidons au canal', type: 'Chimique', dateObservation: '2026-10-02', lieu: 'Canal' },
  { ...base, id: 2, titre: 'Sacs plastiques', type: 'Plastique', dateObservation: '2026-10-09', lieu: 'Parc' },
  { ...base, id: 3, titre: 'Gravats', type: 'Dépôt sauvage', dateObservation: '2026-09-21', lieu: 'Forêt' },
];

describe('PollutionListComponent', () => {
  let component: PollutionListComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PollutionListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(PollutionListComponent);
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
    component.type.set('Plastique');
    expect(component.filtered().map((p) => p.id)).toEqual([2]);
  });

  it('should filter by text, ignoring case and accents', () => {
    component.search.set('CANAL');
    expect(component.filtered().map((p) => p.id)).toEqual([1]);
  });

  it('should filter by date range and combine criteria', () => {
    component.from.set('2026-10-01');
    expect(component.filtered().map((p) => p.id)).toEqual([2, 1]);

    component.to.set('2026-10-05');
    expect(component.filtered().map((p) => p.id)).toEqual([1]);

    component.resetFilters();
    expect(component.filtered().length).toBe(3);
  });
});

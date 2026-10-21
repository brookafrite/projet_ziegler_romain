import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Pollution } from '../models/pollution.model';
import { PollutionService } from './pollution.service';

describe('PollutionService', () => {
  let service: PollutionService;
  let httpMock: HttpTestingController;
  const url = `${environment.apiUrl}/pollutions`;
  const pollution: Pollution = {
    titre: 'Bidons',
    type: 'Chimique',
    description: 'Trois bidons',
    dateObservation: '2026-10-02',
    lieu: 'Canal',
    latitude: 45.79,
    longitude: 4.98,
    photoUrl: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PollutionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() should GET the collection', () => {
    service.getAll().subscribe();
    expect(httpMock.expectOne(url).request.method).toBe('GET');
  });

  it('getById() should GET one pollution', () => {
    service.getById(3).subscribe();
    expect(httpMock.expectOne(`${url}/3`).request.method).toBe('GET');
  });

  it('create() should POST the pollution', () => {
    service.create(pollution).subscribe();
    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(pollution);
  });

  it('update() should PUT the pollution on its id', () => {
    service.update(3, pollution).subscribe();
    const req = httpMock.expectOne(`${url}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(pollution);
  });

  it('delete() should DELETE the pollution', () => {
    service.delete(3).subscribe();
    expect(httpMock.expectOne(`${url}/3`).request.method).toBe('DELETE');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { AddressService } from './address.service';

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;
  const feature = {
    properties: { label: '12 Rue de la République 69002 Lyon' },
    geometry: { coordinates: [4.835769, 45.76511] }, // GeoJSON : longitude, latitude
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should suggest addresses with their GPS coordinates', () => {
    let result: unknown;
    service.search('12 rue de la rep').subscribe((suggestions) => (result = suggestions));

    const req = httpMock.expectOne((r) => r.url === `${environment.addressApiUrl}/search`);
    expect(req.request.params.get('q')).toBe('12 rue de la rep');
    expect(req.request.params.get('autocomplete')).toBe('1');
    req.flush({ features: [feature] });

    expect(result).toEqual([{ label: '12 Rue de la République 69002 Lyon', latitude: 45.76511, longitude: 4.835769 }]);
  });

  it('should find the nearest address of a point, or null', () => {
    let result: unknown = 'pas encore';
    service.reverse(45.76, 4.83).subscribe((address) => (result = address));
    httpMock.expectOne((r) => r.url === `${environment.addressApiUrl}/reverse`).flush({ features: [] });
    expect(result).toBeNull();
  });
});

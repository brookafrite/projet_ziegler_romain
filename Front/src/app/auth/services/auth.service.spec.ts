import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should POST the payload to {apiUrl}/auth/signup', () => {
    const payload = { login: 'brook', password: 'Secret123!', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr' };
    let result: unknown;

    service.signUp(payload).subscribe((user) => (result = user));

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr' };
    req.flush(user);

    expect(result).toEqual(user);
  });
});

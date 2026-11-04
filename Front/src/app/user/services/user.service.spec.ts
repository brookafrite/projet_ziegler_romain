import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const url = `${environment.apiUrl}/users`;
  const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should GET the user list', () => {
    let result: unknown;
    service.getAll().subscribe((users) => (result = users));

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([user]);
    expect(result).toEqual([user]);
  });

  it('should GET one user by id', () => {
    service.getById(1).subscribe();
    expect(httpMock.expectOne(`${url}/1`).request.method).toBe('GET');
  });

  it('should POST the sign-up payload', () => {
    const payload = { login: 'brook', password: 'Secret123!', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr' };
    let result: unknown;
    service.create(payload).subscribe((created) => (result = created));

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(user);
    expect(result).toEqual(user);
  });

  it('should DELETE a user', () => {
    service.delete(1).subscribe();
    expect(httpMock.expectOne(`${url}/1`).request.method).toBe('DELETE');
  });

  it('should POST the credentials to /login', () => {
    service.login({ login: 'brook', password: 'Secret123!' }).subscribe();

    const req = httpMock.expectOne(`${url}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ login: 'brook', password: 'Secret123!' });
  });
});

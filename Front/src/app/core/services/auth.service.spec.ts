import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService (connexion fictive)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' as const };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should keep the user after a successful login, then forget it on logout', () => {
    expect(service.isLoggedIn()).toBe(false);

    service.login({ login: 'brook', password: 'Secret123!' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/users/login`).flush(user);

    expect(service.currentUser()).toEqual(user);
    expect(JSON.parse(localStorage.getItem('carnet-de-terrain-user')!)).toEqual(user);

    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('carnet-de-terrain-user')).toBeNull();
  });

  it('should stay logged out when the credentials are wrong', () => {
    service.login({ login: 'brook', password: 'mauvais' }).subscribe({ error: () => {} });
    httpMock
      .expectOne(`${environment.apiUrl}/users/login`)
      .flush({ message: 'Login ou mot de passe incorrect.' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isLoggedIn()).toBe(false);
  });
});

import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, provideRouter, Route, UrlSegment, UrlTree } from '@angular/router';

import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr' };

  function runGuard() {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as Route, [new UrlSegment('utilisateurs', {})], {} as PartialMatchRouteSnapshot),
    );
  }

  function logInAs(role: string) {
    localStorage.setItem('carnet-de-terrain-user', JSON.stringify({ ...user, role }));
  }

  beforeEach(() => localStorage.clear());

  it('should let an admin through', () => {
    logInAs('admin');
    expect(runGuard()).toBe(true);
  });

  it('should send a standard user back to the pollution list', () => {
    logInAs('utilisateur');
    expect((runGuard() as UrlTree).toString()).toBe('/pollutions');
  });

  it('should send a visitor to the login page, then back to the users page', () => {
    expect((runGuard() as UrlTree).toString()).toBe('/connexion?retour=%2Futilisateurs');
  });
});

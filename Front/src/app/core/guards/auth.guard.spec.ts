import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' };

  function runGuard(url: string) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  beforeEach(() => localStorage.clear());

  it('should let a logged-in user through', () => {
    localStorage.setItem('carnet-de-terrain-user', JSON.stringify(user));
    expect(runGuard('/pollutions/nouvelle')).toBe(true);
  });

  it('should send a visitor to the login page, remembering where they wanted to go', () => {
    const result = runGuard('/pollutions/nouvelle');

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/connexion?retour=%2Fpollutions%2Fnouvelle');
  });
});

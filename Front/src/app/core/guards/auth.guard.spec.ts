import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideStore, Store } from '@ngxs/store';

import { User } from '../models/user.model';
import { Login } from '../states/auth/auth.actions';
import { AuthState } from '../states/auth/auth.state';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const user: User = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' };

  /** Lance le guard pour une adresse ; si un utilisateur est donné, il est d'abord connecté dans le store. */
  function runGuard(url: string, loggedIn?: User) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideStore([AuthState])] });
    if (loggedIn) TestBed.inject(Store).dispatch(new Login(loggedIn));
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  it('should let a logged-in user through', () => {
    expect(runGuard('/pollutions/nouvelle', user)).toBe(true);
  });

  it('should send a visitor to the login page, remembering where they wanted to go', () => {
    const result = runGuard('/pollutions/nouvelle');

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/connexion?retour=%2Fpollutions%2Fnouvelle');
  });
});

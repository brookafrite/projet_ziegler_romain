import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';

import { guestGuard } from './guest.guard';
import { Login } from '../states/auth/auth.actions';
import { AuthState } from '../states/auth/auth.state';

describe('guestGuard', () => {
  const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' as const };

  /** Lance le guard ; si un utilisateur est donné, il est d'abord connecté dans le store. */
  function runGuard(loggedIn?: typeof user) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideStore([AuthState])] });
    if (loggedIn) TestBed.inject(Store).dispatch(new Login(loggedIn));
    return TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }


  it('should let a visitor who is not logged in through', () => {
    expect(runGuard()).toBe(true);
  });

  it('should send a logged-in user back to the pollution list', () => {
    const result = runGuard(user);

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/pollutions');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';

import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
  const user = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' as const };

  function runGuard() {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    return TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  beforeEach(() => localStorage.clear());

  it('should let a visitor who is not logged in through', () => {
    expect(runGuard()).toBe(true);
  });

  it('should send a logged-in user back to the pollution list', () => {
    localStorage.setItem('carnet-de-terrain-user', JSON.stringify(user));

    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/pollutions');
  });
});

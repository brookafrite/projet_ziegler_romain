import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PartialMatchRouteSnapshot, provideRouter, Route, UrlSegment, UrlTree } from '@angular/router';
import { provideStore, Store } from '@ngxs/store';

import { User, UserRole } from '../models/user.model';
import { Login } from '../states/auth/auth.actions';
import { AuthState } from '../states/auth/auth.state';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const user: User = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' };

  /** Lance le guard pour /utilisateurs ; avec un rôle, l'utilisateur est d'abord connecté dans le store. */
  function runGuard(role?: UserRole) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideStore([AuthState])] });
    if (role) TestBed.inject(Store).dispatch(new Login({ ...user, role }));
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as Route, [new UrlSegment('utilisateurs', {})], {} as PartialMatchRouteSnapshot),
    );
  }

  it('should let an admin through', () => {
    expect(runGuard('admin')).toBe(true);
  });

  it('should send a standard user back to the pollution list', () => {
    expect((runGuard('utilisateur') as UrlTree).toString()).toBe('/pollutions');
  });

  it('should send a visitor to the login page, then back to the users page', () => {
    expect((runGuard() as UrlTree).toString()).toBe('/connexion?retour=%2Futilisateurs');
  });
});

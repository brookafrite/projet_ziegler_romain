import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';

import { User } from '../../models/user.model';
import { Login, Logout } from './auth.actions';
import { AuthState } from './auth.state';

describe('AuthState (NGXS)', () => {
  let store: Store;
  const user: User = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideStore([AuthState])] });
    store = TestBed.inject(Store);
  });

  it('should start logged out', () => {
    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthState.user)).toBeNull();
    expect(store.selectSnapshot(AuthState.username)).toBe('');
  });

  it('should keep the user after Login, then forget it after Logout', () => {
    store.dispatch(new Login(user));
    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(AuthState.user)).toEqual(user);
    expect(store.selectSnapshot(AuthState.username)).toBe('Romain Ziegler');

    store.dispatch(new Logout());
    expect(store.selectSnapshot(AuthState.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthState.user)).toBeNull();
  });

  it('should produce a new state instead of changing the old one (immutability)', () => {
    const before = store.selectSnapshot((state) => state.auth);
    store.dispatch(new Login(user));
    const after = store.selectSnapshot((state) => state.auth);

    expect(after).not.toBe(before);
    expect(before.isAuthenticated).toBe(false); // l'ancien état n'a pas bougé
  });

  it('should let only the author or an admin manage a pollution', () => {
    expect(store.selectSnapshot(AuthState.canManage)(1)).toBe(false); // personne n'est connecté

    store.dispatch(new Login(user)); // id 1, utilisateur
    const canManage = store.selectSnapshot(AuthState.canManage);
    expect(canManage(1)).toBe(true);
    expect(canManage(2)).toBe(false);
    expect(canManage(null)).toBe(false);

    store.dispatch(new Login({ ...user, id: 9, role: 'admin' }));
    expect(store.selectSnapshot(AuthState.isAdmin)).toBe(true);
    expect(store.selectSnapshot(AuthState.canManage)(2)).toBe(true);
  });
});

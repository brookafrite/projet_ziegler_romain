import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  GuardResult,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { provideStore, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { Login } from '../../../core/states/auth/auth.actions';
import { AuthState } from '../../../core/states/auth/auth.state';
import { pollutionAuthorGuard } from './pollution-author.guard';

describe('pollutionAuthorGuard', () => {
  const user: User = { id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' };

  /** Lance le guard pour /pollutions/5/modifier, puis renvoie la réponse de l'API simulée. */
  function runGuard(auteurId: number | null): GuardResult | undefined {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideStore([AuthState])],
    });
    TestBed.inject(Store).dispatch(new Login(user)); // l'utilisateur n° 1 est connecté
    const route = { paramMap: convertToParamMap({ id: '5' }) } as ActivatedRouteSnapshot;
    const result$ = TestBed.runInInjectionContext(() =>
      pollutionAuthorGuard(route, {} as RouterStateSnapshot),
    ) as Observable<GuardResult>;

    let result: GuardResult | undefined;
    result$.subscribe((value) => (result = value));
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiUrl}/pollutions/5`)
      .flush({ id: 5, titre: 'Test', auteurId });
    return result;
  }

  it('should let the author edit their own pollution', () => {
    expect(runGuard(1)).toBe(true);
  });

  it("should send another user back to the pollution's record", () => {
    const result = runGuard(2);
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/pollutions/5');
  });
});

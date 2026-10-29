import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pollution } from '../../pollution/models/pollution.model';
import { mockApiInterceptor } from './mock-api.interceptor';

describe('mockApiInterceptor (backend simulé)', () => {
  let http: HttpClient;
  const url = `${environment.apiUrl}/pollutions`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockApiInterceptor]))],
    });
    http = TestBed.inject(HttpClient);
  });

  it('should create, read, update and delete a pollution', async () => {
    const created = await firstValueFrom(
      http.post<Pollution>(url, {
        titre: 'Test CRUD',
        type: 'Air',
        description: 'Fumée',
        dateObservation: '2026-10-01',
        lieu: 'Usine',
        latitude: 45,
        longitude: 4,
        photoUrl: null,
      }),
    );
    expect(created.id).toBeGreaterThan(0);

    const list = await firstValueFrom(http.get<Pollution[]>(url));
    expect(list.some((p) => p.id === created.id)).toBe(true);

    const updated = await firstValueFrom(
      http.put<Pollution>(`${url}/${created.id}`, { ...created, titre: 'Titre modifié' }),
    );
    expect(updated.titre).toBe('Titre modifié');

    await firstValueFrom(http.delete(`${url}/${created.id}`));
    const error = await firstValueFrom(http.get(`${url}/${created.id}`)).catch((e) => e);
    expect((error as HttpErrorResponse).status).toBe(404);
  });

  it('should refuse a sign-up with a login already used', async () => {
    const user = { login: 'dupont', password: 'Secret123!', nom: 'Dupont', prenom: 'Alice', email: 'alice@test.fr' };
    const created = await firstValueFrom(http.post<Record<string, unknown>>(`${environment.apiUrl}/auth/signup`, user));
    expect(created['password']).toBeUndefined(); // le mot de passe n'est jamais renvoyé

    const error = await firstValueFrom(http.post(`${environment.apiUrl}/auth/signup`, user)).catch((e) => e);
    expect((error as HttpErrorResponse).status).toBe(409);
  });
});

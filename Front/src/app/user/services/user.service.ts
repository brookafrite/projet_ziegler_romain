import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, SignUpRequest, User } from '../models/user.model';

/** Appels à l'API des utilisateurs (api/src/routes/user.routes.ts). */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /** GET {apiUrl}/users : liste des utilisateurs. */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  /** GET {apiUrl}/users/:id : détail d'un utilisateur. */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  /** POST {apiUrl}/users : crée un compte et renvoie l'utilisateur créé. */
  create(payload: SignUpRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload);
  }

  /** DELETE {apiUrl}/users/:id : supprime un utilisateur. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** POST {apiUrl}/users/login : vérifie les identifiants et renvoie l'utilisateur. */
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, credentials);
  }
}

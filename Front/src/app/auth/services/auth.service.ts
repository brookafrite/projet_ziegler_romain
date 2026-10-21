import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SignUpRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** POST {apiUrl}/auth/signup : crée un compte et renvoie l'utilisateur créé. */
  signUp(payload: SignUpRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/signup`, payload);
  }
}

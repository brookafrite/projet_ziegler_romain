import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pollution } from '../models/pollution.model';

/**
 * Point d'entrée unique vers l'API des pollutions (CRUD).
 * L'URL vient de l'environnement : le service ne change pas entre dev et prod.
 */
@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pollutions`;

  /** Read : toutes les pollutions. */
  getAll(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.baseUrl);
  }

  /** Read : une pollution, par son identifiant. */
  getById(id: number): Observable<Pollution> {
    return this.http.get<Pollution>(`${this.baseUrl}/${id}`);
  }

  /** Create : l'API attribue l'identifiant et renvoie la pollution créée. */
  create(pollution: Pollution): Observable<Pollution> {
    return this.http.post<Pollution>(this.baseUrl, pollution);
  }

  /** Update : remplace la pollution existante. */
  update(id: number, pollution: Pollution): Observable<Pollution> {
    return this.http.put<Pollution>(`${this.baseUrl}/${id}`, pollution);
  }

  /** Delete : supprime la pollution. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

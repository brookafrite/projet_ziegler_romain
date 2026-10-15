import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pollution } from '../models/pollution.model';

/**
 * Point d'entrée unique vers le backend.
 * Pour l'instant les données restent côté front et le numéro de fiche
 * est attribué ici ; plus tard, il suffira d'injecter HttpClient et de
 * remplacer of(...) par un appel à l'API (qui renverra l'id).
 */
@Injectable({ providedIn: 'root' })
export class PollutionService {
  private nextId = 1;

  declare(pollution: Pollution): Observable<Pollution> {
    // return this.http.post<Pollution>(`${API_URL}/pollutions`, pollution);
    return of({ ...pollution, id: this.nextId++ });
  }
}

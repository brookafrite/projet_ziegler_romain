import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pollution } from '../../pollution/models/pollution.model';
import { MockDb, StoredUser } from './mock-db';

const db = new MockDb();

/** Délai de réponse simulé, pour voir les états « chargement ». */
const LATENCY_MS = 300;

/**
 * Backend simulé : intercepte les requêtes HttpClient vers environment.apiUrl
 * et y répond comme le ferait une vraie API REST.
 * Les services ne savent pas que l'API est simulée : ils font de vrais appels HTTP.
 * Seules les ressources marquées true dans environment.mockApi sont simulées.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const path = req.url.slice(environment.apiUrl.length); // ex. : /pollutions/3
  const resource = path.split('/')[1] as keyof typeof environment.mockApi;
  if (!environment.mockApi[resource]) {
    return next(req); // requête normale, envoyée à la vraie API
  }

  return handle(req, path).pipe(delay(LATENCY_MS));
};

function handle(req: HttpRequest<unknown>, path: string): Observable<HttpEvent<unknown>> {
  const [, resource, rawId] = path.split('/'); // '/pollutions/3' → ['', 'pollutions', '3']
  const id = Number(rawId);

  if (resource === 'pollutions') {
    switch (req.method) {
      case 'GET':
        return rawId ? getPollution(id) : ok(db.pollutions);
      case 'POST':
        return createPollution(req.body as Pollution);
      case 'PUT':
        return updatePollution(id, req.body as Pollution);
      case 'DELETE':
        return deletePollution(id);
    }
  }

  if (resource === 'auth' && rawId === 'signup' && req.method === 'POST') {
    return signUp(req.body as Omit<StoredUser, 'id'>);
  }

  return error(404, `Route inconnue : ${req.method} ${path}`);
}

// --- Pollutions --------------------------------------------------------

function getPollution(id: number) {
  const pollution = db.pollutions.find((p) => p.id === id);
  return pollution ? ok(pollution) : error(404, 'Pollution introuvable.');
}

function createPollution(body: Pollution) {
  const created: Pollution = { ...body, id: db.nextId(db.pollutions) };
  db.pollutions.push(created);
  db.save();
  return ok(created, 201);
}

function updatePollution(id: number, body: Pollution) {
  const index = db.pollutions.findIndex((p) => p.id === id);
  if (index === -1) return error(404, 'Pollution introuvable.');

  const updated: Pollution = { ...body, id }; // l'id de l'URL fait foi
  db.pollutions[index] = updated;
  db.save();
  return ok(updated);
}

function deletePollution(id: number) {
  const index = db.pollutions.findIndex((p) => p.id === id);
  if (index === -1) return error(404, 'Pollution introuvable.');

  db.pollutions.splice(index, 1);
  db.save();
  return ok(null, 204);
}

// --- Inscription -------------------------------------------------------

function signUp(body: Omit<StoredUser, 'id'>) {
  const taken = db.users.some((u) => u.login === body.login || u.email === body.email);
  if (taken) return error(409, 'Ce login ou cet email est déjà utilisé.');

  const user: StoredUser = { ...body, id: db.nextId(db.users) };
  db.users.push(user);
  db.save();

  const { password, ...publicUser } = user; // on ne renvoie jamais le mot de passe
  return ok(publicUser, 201);
}

// --- Réponses ----------------------------------------------------------

function ok(body: unknown, status = 200): Observable<HttpEvent<unknown>> {
  return of(new HttpResponse({ status, body: structuredClone(body) }));
}

function error(status: number, message: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error: { message } }));
}

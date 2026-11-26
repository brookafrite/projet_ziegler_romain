import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';

/** Une adresse proposée, avec ses coordonnées GPS. */
export interface AddressSuggestion {
  label: string; // « 12 Rue de la République 69002 Lyon »
  latitude: number;
  longitude: number;
}

/** Réponse de l'API Adresse (format GeoJSON : longitude d'abord, puis latitude). */
interface GeocodingResponse {
  features: { properties: { label: string }; geometry: { coordinates: [number, number] } }[];
}

/**
 * Appels à l'API Adresse de l'État : suggestions pendant la saisie du lieu,
 * et adresse la plus proche d'un point (pour « Utiliser ma position »).
 * Elle ne connaît que les adresses françaises.
 */
@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.addressApiUrl;

  /** Adresses qui commencent comme le texte saisi (5 au plus). */
  search(text: string): Observable<AddressSuggestion[]> {
    return this.http
      .get<GeocodingResponse>(`${this.baseUrl}/search`, {
        params: { q: text, autocomplete: 1, limit: 5 },
      })
      .pipe(map((response) => response.features.map(toSuggestion)));
  }

  /** Adresse la plus proche d'un point, ou null s'il n'y en a pas (en pleine mer, à l'étranger…). */
  reverse(latitude: number, longitude: number): Observable<AddressSuggestion | null> {
    return this.http
      .get<GeocodingResponse>(`${this.baseUrl}/reverse`, {
        params: { lat: latitude, lon: longitude, limit: 1 },
      })
      .pipe(map((response) => (response.features[0] ? toSuggestion(response.features[0]) : null)));
  }
}

function toSuggestion(feature: GeocodingResponse['features'][number]): AddressSuggestion {
  const [longitude, latitude] = feature.geometry.coordinates;
  return { label: feature.properties.label, latitude, longitude };
}

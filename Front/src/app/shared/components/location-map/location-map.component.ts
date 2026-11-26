import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';

/** Un point sur la carte. */
export interface MapPoint {
  latitude: number;
  longitude: number;
}

/** Vue de la France entière, quand aucun point n'est encore choisi. */
const FRANCE: L.LatLngTuple = [46.6, 2.4];

/** Marqueur dessiné en CSS (les images par défaut de Leaflet se perdent au build). */
const MARKER = L.divIcon({ className: 'pollution-marker', iconSize: [22, 22], iconAnchor: [11, 11] });

/**
 * Carte OpenStreetMap (bibliothèque Leaflet) pour placer la pollution.
 * - [latitude] / [longitude] : le point affiché, qui suit les champs du formulaire ;
 * - (picked) : émis quand l'utilisateur clique sur la carte ou fait glisser le marqueur.
 * Leaflet manipule lui-même le DOM : on crée la carte après l'affichage (afterNextRender)
 * et on la détruit avec le composant.
 */
@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.component.html',
  styleUrl: './location-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationMapComponent {
  readonly latitude = input<number | null>(null);
  readonly longitude = input<number | null>(null);
  readonly picked = output<MapPoint>();

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('map');
  private map?: L.Map;
  private marker?: L.Marker;

  constructor() {
    afterNextRender(() => this.createMap());
    // Les champs latitude / longitude changent (adresse choisie, position, saisie) : le marqueur suit
    effect(() => this.showPoint(this.latitude(), this.longitude()));
    inject(DestroyRef).onDestroy(() => this.map?.remove());
  }

  private createMap(): void {
    this.map = L.map(this.container().nativeElement, { center: FRANCE, zoom: 5 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    // Un clic sur la carte place la pollution à cet endroit
    this.map.on('click', (event: L.LeafletMouseEvent) => this.pick(event.latlng));
    this.showPoint(this.latitude(), this.longitude());
  }

  /** Affiche le marqueur au point donné (s'il est valide) et centre la carte dessus. */
  private showPoint(latitude: number | null, longitude: number | null): void {
    if (!this.map || !isValidPoint(latitude, longitude)) return;
    const position: L.LatLngTuple = [latitude!, longitude!];

    if (!this.marker) {
      this.marker = L.marker(position, { icon: MARKER, draggable: true, title: 'Position de la pollution' });
      this.marker.on('dragend', () => this.pick(this.marker!.getLatLng()));
      this.marker.addTo(this.map);
      this.map.setView(position, 16);
    } else {
      this.marker.setLatLng(position);
      this.map.panTo(position);
    }
  }

  private pick({ lat, lng }: L.LatLng): void {
    this.picked.emit({ latitude: lat, longitude: lng });
  }
}

function isValidPoint(latitude: number | null, longitude: number | null): boolean {
  return (
    latitude !== null && longitude !== null &&
    Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
  );
}

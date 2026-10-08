import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Pollution } from '../models/pollution.model';

@Component({
  selector: 'app-pollution-recap',
  templateUrl: './pollution-recap.component.html',
  styleUrl: './pollution-recap.component.css',
})
export class PollutionRecapComponent implements OnChanges {
  @Input({ required: true }) pollution!: Pollution;
  @Output() newDeclaration = new EventEmitter<void>();

  imageError = false;

  ngOnChanges(): void {
    this.imageError = false; // nouvelle déclaration : on retente l'affichage de l'image
  }

  get formattedDate(): string {
    const [y, m, d] = this.pollution.dateObservation.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  get mapUrl(): string {
    const { latitude, longitude } = this.pollution;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  }
}

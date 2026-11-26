import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

/** auto : suit le réglage de l'ordinateur ; light / dark : choix forcé par l'utilisateur. */
export type ThemeChoice = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'carnet-de-terrain-theme';
const ORDER: ThemeChoice[] = ['auto', 'light', 'dark'];

/**
 * Thème du site, choisi avec le bouton du menu. Le choix est posé sur <html data-theme="…">
 * (styles.css en déduit les couleurs) et gardé dans le localStorage pour la prochaine visite.
 * Le petit script de index.html l'applique déjà avant le démarrage d'Angular.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<ThemeChoice>(this.restore());

  readonly choice = this.current.asReadonly();

  constructor() {
    this.apply(this.current());
  }

  /** Passe au thème suivant : automatique → clair → sombre → automatique. */
  next(): void {
    const index = ORDER.indexOf(this.current());
    this.set(ORDER[(index + 1) % ORDER.length]);
  }

  set(choice: ThemeChoice): void {
    this.current.set(choice);
    this.apply(choice);
    try {
      if (choice === 'auto') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // localStorage indisponible : le choix vaut pour cette visite seulement
    }
  }

  private apply(choice: ThemeChoice): void {
    const root = this.document.documentElement;
    if (choice === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);
  }

  private restore(): ThemeChoice {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'auto';
    } catch {
      return 'auto';
    }
  }
}

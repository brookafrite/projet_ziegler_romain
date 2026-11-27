import { Location, ViewportScroller } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Adresse de la liste des pollutions, avec ou sans critères (?type=…&tri=…). */
const LIST_URL = /^\/pollutions(\?.*)?$/;

/**
 * Se souvient de la dernière vue de la liste des pollutions (filtres et tri compris),
 * pour que « Retour à la liste » y ramène au lieu d'une liste vierge.
 * Un seul exemplaire pour toute l'application (core) : il écoute le routeur dès le démarrage.
 */
@Injectable({ providedIn: 'root' })
export class ListReturnService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly scroller = inject(ViewportScroller);

  /** Dernière adresse de la liste visitée. */
  private lastListUrl = '/pollutions';
  /** Vrai si la page précédente était la liste : un simple retour arrière suffit. */
  private cameFromList = false;
  private previousUrl = '';
  /** Position dans la page de la liste au moment où on l'a quittée. */
  private savedScroll = 0;
  /** Vrai pendant un retour arrière vers la liste : il faudra y restaurer la position. */
  private restoreOnReturn = false;

  constructor() {
    // On quitte une page : si c'est la liste, on note où l'on était dans la page.
    // On y revient par un retour arrière (bouton du site ou du navigateur) : on le note aussi.
    this.router.events
      .pipe(filter((event): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event) => {
        if (LIST_URL.test(this.router.url)) this.savedScroll = this.scroller.getScrollPosition()[1];
        this.restoreOnReturn = event.navigationTrigger === 'popstate' && LIST_URL.test(event.url);
      });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(({ urlAfterRedirects: url }) => {
        this.cameFromList = LIST_URL.test(this.previousUrl);
        if (LIST_URL.test(url)) this.lastListUrl = url;
        this.previousUrl = url;
      });
  }

  /** L'adresse à ouvrir pour revenir à la liste, telle qu'on l'avait laissée. */
  get listUrl(): string {
    return this.lastListUrl;
  }

  /**
   * Appelé par la liste une fois ses pollutions affichées : après un retour arrière, on
   * retrouve la position dans la page (avant, la liste vide était trop courte pour y descendre).
   */
  restoreScroll(): void {
    if (!this.restoreOnReturn) return;
    this.restoreOnReturn = false;
    this.scroller.scrollToPosition([0, this.savedScroll]);
  }

  /**
   * Revient à la liste. Si l'on vient d'elle, c'est un vrai retour arrière : le navigateur
   * retrouve aussi la position dans la page. Sinon, on ouvre la dernière vue de la liste.
   */
  backToList(): void {
    if (this.cameFromList) this.location.back();
    else this.router.navigateByUrl(this.lastListUrl);
  }
}

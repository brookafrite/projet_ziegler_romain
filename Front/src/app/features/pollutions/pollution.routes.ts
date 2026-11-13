import { Routes } from '@angular/router';

/**
 * Routes de la fonctionnalité « pollutions », chargées à la demande (loadChildren dans
 * app.routes.ts) : leur code n'est téléchargé qu'à la première visite d'une adresse /pollutions/…
 */
export const POLLUTION_ROUTES: Routes = [
  {
    path: '',
    title: 'Pollutions signalées',
    loadComponent: () =>
      import('./pollution-list/pollution-list.component').then((m) => m.PollutionListComponent),
  },
  // « nouvelle » doit être déclarée avant « :id », sinon elle serait lue comme un identifiant
  {
    path: 'nouvelle',
    title: 'Signaler une pollution',
    loadComponent: () =>
      import('./pollution-declaration/pollution-declaration.component').then(
        (m) => m.PollutionDeclarationComponent,
      ),
  },
  {
    path: ':id',
    title: 'Fiche pollution',
    loadComponent: () =>
      import('./pollution-detail/pollution-detail.component').then((m) => m.PollutionDetailComponent),
  },
  {
    path: ':id/modifier',
    title: 'Modifier une pollution',
    loadComponent: () =>
      import('./pollution-edit/pollution-edit.component').then((m) => m.PollutionEditComponent),
  },
];

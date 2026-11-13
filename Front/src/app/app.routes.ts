import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';

/**
 * Chaque page est chargée à la demande (lazy loading) : son code n'est téléchargé
 * que lorsque l'utilisateur ouvre l'adresse correspondante.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  {
    path: 'pollutions',
    loadChildren: () =>
      import('./features/pollutions/pollution.routes').then((m) => m.POLLUTION_ROUTES),
  },
  // Réservées aux visiteurs non connectés (voir core/guards/guest.guard.ts)
  {
    path: 'inscription',
    title: 'Créer un compte',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'connexion',
    title: 'Connexion',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'utilisateurs',
    title: 'Utilisateurs',
    loadComponent: () =>
      import('./features/admin/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  // Ancienne adresse du TP02
  { path: 'signalement', redirectTo: 'pollutions/nouvelle' },
  { path: '**', redirectTo: 'pollutions' },
];

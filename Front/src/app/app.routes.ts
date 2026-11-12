import { Routes } from '@angular/router';
import { guestGuard } from './user/guards/guest.guard';
import { LoginComponent } from './user/login/login.component';
import { SignUpComponent } from './user/sign-up/sign-up.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { PollutionDeclarationComponent } from './pollution/pollution-declaration/pollution-declaration.component';
import { PollutionDetailComponent } from './pollution/pollution-detail/pollution-detail.component';
import { PollutionEditComponent } from './pollution/pollution-edit/pollution-edit.component';
import { PollutionListComponent } from './pollution/pollution-list/pollution-list.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
  { path: 'pollutions', component: PollutionListComponent, title: 'Pollutions signalées' },
  // « nouvelle » doit être déclarée avant « :id », sinon elle serait lue comme un identifiant
  { path: 'pollutions/nouvelle', component: PollutionDeclarationComponent, title: 'Signaler une pollution' },
  { path: 'pollutions/:id', component: PollutionDetailComponent, title: 'Fiche pollution' },
  { path: 'pollutions/:id/modifier', component: PollutionEditComponent, title: 'Modifier une pollution' },
  // Réservées aux visiteurs non connectés (voir user/guards/guest.guard.ts)
  { path: 'inscription', component: SignUpComponent, title: 'Créer un compte', canActivate: [guestGuard] },
  { path: 'connexion', component: LoginComponent, title: 'Connexion', canActivate: [guestGuard] },
  { path: 'utilisateurs', component: UserListComponent, title: 'Utilisateurs' },
  // Ancienne adresse du TP02
  { path: 'signalement', redirectTo: 'pollutions/nouvelle' },
  { path: '**', redirectTo: 'pollutions' },
];

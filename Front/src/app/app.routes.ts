import { Routes } from '@angular/router';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
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
  { path: 'inscription', component: SignUpComponent, title: 'Créer un compte' },
  // Ancienne adresse du TP02
  { path: 'signalement', redirectTo: 'pollutions/nouvelle' },
  { path: '**', redirectTo: 'pollutions' },
];

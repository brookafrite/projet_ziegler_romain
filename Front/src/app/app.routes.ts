import { Routes } from '@angular/router';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { PollutionDeclarationComponent } from './pollution/pollution-declaration/pollution-declaration.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'signalement' },
  { path: 'signalement', component: PollutionDeclarationComponent, title: 'Signaler une pollution' },
  { path: 'inscription', component: SignUpComponent, title: 'Créer un compte' },
  { path: '**', redirectTo: 'signalement' },
];

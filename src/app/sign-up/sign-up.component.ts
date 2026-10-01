import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatchPasswordDirective } from './match-password.directive';

interface SignUpModel {
  login: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  email: string;
}

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, MatchPasswordDirective],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  model: SignUpModel = {
    login: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    email: '',
  };

  submitted = false;

  onSubmit(form: NgForm): void {
    if (form.invalid) return; // sécurité en plus du bouton désactivé

    const { confirmPassword, ...payload } = this.model;
    console.log('Inscription :', payload);
    this.submitted = true;
  }
}

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

const EMPTY_MODEL: SignUpModel = {
  login: '',
  password: '',
  confirmPassword: '',
  nom: '',
  prenom: '',
  email: '',
};

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, MatchPasswordDirective],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  model: SignUpModel = { ...EMPTY_MODEL };
  showPassword = false;
  submitted = false;

  /** Force du mot de passe : de 0 (vide) à 4 (excellent). */
  get strength(): number {
    const p = this.model.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.max(score, 1);
  }

  get strengthLabel(): string {
    return ['', 'Faible', 'Moyen', 'Bon', 'Excellent'][this.strength];
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return; // sécurité en plus du bouton désactivé

    const { confirmPassword, ...payload } = this.model;
    console.log('Inscription :', payload);
    this.submitted = true;
  }

  newSignUp(): void {
    this.model = { ...EMPTY_MODEL };
    this.showPassword = false;
    this.submitted = false;
  }
}

import { Component, signal } from '@angular/core';
import { SignUpComponent } from './sign-up/sign-up.component';

@Component({
  imports: [SignUpComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App 
{
  protected readonly title = signal('projet_ZIEGLER_Romain');
}
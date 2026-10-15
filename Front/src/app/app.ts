import { Component, signal } from '@angular/core';
import { PollutionDeclarationComponent } from './pollution/pollution-declaration/pollution-declaration.component';

@Component({
  imports: [PollutionDeclarationComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('projet_ZIEGLER_Romain');
}

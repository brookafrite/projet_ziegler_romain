import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear(); // personne n'est connecté au départ
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the site header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-name')?.textContent).toContain('Carnet de terrain');
  });

  it('should link to every page', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.nav a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/pollutions',
      '/pollutions/nouvelle',
      '/utilisateurs',
      '/connexion',
      '/inscription',
    ]);
  });

  it('should greet the logged-in user instead of the login links', async () => {
    localStorage.setItem(
      'carnet-de-terrain-user',
      JSON.stringify({ id: 1, login: 'brook', nom: 'Ziegler', prenom: 'Romain', email: 'romain@test.fr', role: 'utilisateur' as const }),
    );
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const nav = (fixture.nativeElement as HTMLElement).querySelector('.nav')!;
    expect(nav.textContent).toContain('Bonjour Romain');
    expect(nav.querySelector('a[href="/connexion"]')).toBeNull();
  });
});
